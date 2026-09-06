using RoyalDryFruits.Application.DTOs;
using RoyalDryFruits.Domain.Entities;
using RoyalDryFruits.Domain.Enums;
using RoyalDryFruits.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace RoyalDryFruits.API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
[Route("api/admin/orders")]
public class AdminOrdersController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminOrdersController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? channel)
    {
        var query = _db.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.ProductVariant!)
                    .ThenInclude(pv => pv.Product)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status, true, out var orderStatus))
        {
            query = query.Where(o => o.Status == orderStatus);
        }

        if (!string.IsNullOrWhiteSpace(channel) && channel.ToLower() != "all")
        {
            var cleanChannel = channel.Trim().ToLower();
            query = query.Where(o => (o.Channel ?? "Online").ToLower() == cleanChannel);
        }

        var productImages = await GetProductImageLookupAsync();

        // Load to memory first so ThenInclude navigation properties are available for projection
        var rawOrders = await query
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var orders = rawOrders.Select(o => new OrderDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            CustomerName = o.CustomerName,
            CustomerPhone = o.CustomerPhone,
            CustomerEmail = o.CustomerEmail,
            DeliveryAddress = o.DeliveryAddress,
            SubTotal = o.SubTotal,
            DeliveryCharge = o.DeliveryCharge,
            TotalAmount = o.TotalAmount,
            Status = o.Status,
            CancellationReason = o.CancellationReason,
            PaymentMethod = o.PaymentMethod,
            Channel = o.Channel ?? "Online",
            CreatedAt = o.CreatedAt,
            UpdatedAt = o.UpdatedAt,
            Items = o.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductVariantId = i.ProductVariantId,
                ProductName = i.ProductName,
                WeightLabel = i.WeightLabel,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                TotalPrice = i.TotalPrice,
                Image = ResolveItemImage(i, productImages)
            }).ToList()
        }).ToList();

        return Ok(orders);
    }

    [HttpPost("pos")]
    public async Task<IActionResult> CreateStoreOrder([FromBody] CreateOrderRequest req)
    {
        if (req == null || req.Items == null || !req.Items.Any())
        {
            return BadRequest(new { message = "In-store bill must contain at least one item." });
        }

        var orderNumber = "#POS-" + Random.Shared.Next(10000, 99999);
        var subTotal = req.Items.Sum(i => i.UnitPrice * i.Quantity);
        var totalAmount = subTotal + req.DeliveryCharge;

        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = orderNumber,
            CustomerName = string.IsNullOrWhiteSpace(req.CustomerName) ? "Walk-in Customer" : req.CustomerName.Trim(),
            CustomerPhone = req.CustomerPhone?.Trim() ?? string.Empty,
            CustomerEmail = req.CustomerEmail?.Trim() ?? string.Empty,
            DeliveryAddress = string.IsNullOrWhiteSpace(req.DeliveryAddress) ? "Store Counter / Walk-in" : req.DeliveryAddress.Trim(),
            PaymentMethod = string.IsNullOrWhiteSpace(req.PaymentMethod) ? "Cash" : req.PaymentMethod.Trim(),
            Channel = "Offline",
            SubTotal = subTotal,
            DeliveryCharge = req.DeliveryCharge,
            TotalAmount = totalAmount,
            Status = OrderStatus.Delivered, // In-store walk-in sales are fulfilled immediately
            CreatedAt = DateTime.UtcNow,
            Items = new List<OrderItem>()
        };

        var productImages = await GetProductImageLookupAsync();

        foreach (var item in req.Items)
        {
            Guid? validVariantId = null;
            if (item.ProductVariantId.HasValue && item.ProductVariantId.Value != Guid.Empty)
            {
                var variantExists = await _db.ProductVariants.AnyAsync(pv => pv.Id == item.ProductVariantId.Value);
                if (variantExists)
                {
                    validVariantId = item.ProductVariantId.Value;
                }
            }

            if (!validVariantId.HasValue && !string.IsNullOrWhiteSpace(item.ProductName))
            {
                var cleanName = item.ProductName.Trim().ToLower();
                var matchedVariant = await _db.ProductVariants
                    .Include(pv => pv.Product)
                    .FirstOrDefaultAsync(pv => pv.Product.Name.ToLower() == cleanName || cleanName.Contains(pv.Product.Name.ToLower()));
                if (matchedVariant != null)
                {
                    validVariantId = matchedVariant.Id;
                }
            }

            // Immediately deduct stock for in-store sale
            if (validVariantId.HasValue)
            {
                var variantEntity = await _db.ProductVariants.FindAsync(validVariantId.Value);
                if (variantEntity != null)
                {
                    var qtyToDeduct = item.Quantity > 0 ? item.Quantity : 1;
                    variantEntity.StockQuantity = Math.Max(0, variantEntity.StockQuantity - qtyToDeduct);
                }
            }

            order.Items.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                ProductVariantId = validVariantId,
                ProductName = item.ProductName ?? "Product",
                WeightLabel = item.WeightLabel ?? "500g",
                UnitPrice = item.UnitPrice,
                Quantity = item.Quantity > 0 ? item.Quantity : 1,
                TotalPrice = item.UnitPrice * (item.Quantity > 0 ? item.Quantity : 1)
            });
        }

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        var responseDto = new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            CustomerName = order.CustomerName,
            CustomerPhone = order.CustomerPhone,
            CustomerEmail = order.CustomerEmail,
            DeliveryAddress = order.DeliveryAddress,
            SubTotal = order.SubTotal,
            DeliveryCharge = order.DeliveryCharge,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            PaymentMethod = order.PaymentMethod,
            Channel = order.Channel,
            CreatedAt = order.CreatedAt,
            Items = order.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductVariantId = i.ProductVariantId,
                ProductName = i.ProductName,
                WeightLabel = i.WeightLabel,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                TotalPrice = i.TotalPrice,
                Image = ResolveItemImage(i, productImages)
            }).ToList()
        };

        return Ok(responseDto);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var productImages = await GetProductImageLookupAsync();

        Order? o = null;
        if (Guid.TryParse(id, out var guidId))
        {
            o = await _db.Orders
                .Include(x => x.Items)
                    .ThenInclude(i => i.ProductVariant!)
                        .ThenInclude(pv => pv.Product)
                .FirstOrDefaultAsync(x => x.Id == guidId);
        }

        if (o == null)
        {
            var cleanNumber = id.Trim();
            o = await _db.Orders
                .Include(x => x.Items)
                    .ThenInclude(i => i.ProductVariant!)
                        .ThenInclude(pv => pv.Product)
                .FirstOrDefaultAsync(x => x.OrderNumber == cleanNumber || x.OrderNumber == "#" + cleanNumber || x.OrderNumber == cleanNumber.TrimStart('#'));
        }

        if (o == null) return NotFound(new { message = "Order not found" });

        return Ok(new OrderDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            CustomerName = o.CustomerName,
            CustomerPhone = o.CustomerPhone,
            CustomerEmail = o.CustomerEmail,
            DeliveryAddress = o.DeliveryAddress,
            SubTotal = o.SubTotal,
            DeliveryCharge = o.DeliveryCharge,
            TotalAmount = o.TotalAmount,
            Status = o.Status,
            CancellationReason = o.CancellationReason,
            PaymentMethod = o.PaymentMethod,
            Channel = o.Channel ?? "Online",
            CreatedAt = o.CreatedAt,
            UpdatedAt = o.UpdatedAt,
            Items = o.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductVariantId = i.ProductVariantId,
                ProductName = i.ProductName,
                WeightLabel = i.WeightLabel,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                TotalPrice = i.TotalPrice,
                Image = ResolveItemImage(i, productImages)
            }).ToList()
        });
    }

    private async Task<Dictionary<string, string>> GetProductImageLookupAsync()
    {
        var products = await _db.Products
            .AsNoTracking()
            .Where(p => !string.IsNullOrEmpty(p.ImageUrl))
            .ToListAsync();

        var dict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var p in products)
        {
            if (!string.IsNullOrWhiteSpace(p.Name) && !string.IsNullOrWhiteSpace(p.ImageUrl))
            {
                dict[p.Name.Trim()] = p.ImageUrl;
            }
        }
        return dict;
    }

    private static string? ResolveItemImage(OrderItem i, Dictionary<string, string> productImages)
    {
        if (!string.IsNullOrEmpty(i.ProductVariant?.Product?.ImageUrl))
            return i.ProductVariant.Product.ImageUrl;

        if (!string.IsNullOrEmpty(i.ProductName))
        {
            var clean = i.ProductName.Trim();
            if (productImages.TryGetValue(clean, out var img))
                return img;

            var match = productImages.FirstOrDefault(kv => 
                clean.IndexOf(kv.Key, StringComparison.OrdinalIgnoreCase) >= 0 || 
                kv.Key.IndexOf(clean, StringComparison.OrdinalIgnoreCase) >= 0);
            
            if (!string.IsNullOrEmpty(match.Value))
                return match.Value;
        }

        return null;
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateOrderStatusRequest request)
    {
        Order? order = null;
        if (Guid.TryParse(id, out var guidId))
        {
            order = await _db.Orders
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.Id == guidId);
        }

        if (order == null)
        {
            var cleanNumber = id.Trim();
            order = await _db.Orders
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => 
                    x.OrderNumber == cleanNumber || 
                    x.OrderNumber == "#" + cleanNumber || 
                    x.OrderNumber == cleanNumber.TrimStart('#'));
        }

        if (order == null) return NotFound(new { message = "Order not found" });

        var previousStatus = order.Status;
        order.Status = request.Status;

        // Stock management on status change
        if (previousStatus != OrderStatus.Cancelled && request.Status == OrderStatus.Cancelled)
        {
            // Restore inventory
            foreach (var item in order.Items)
            {
                if (item.ProductVariantId.HasValue)
                {
                    var variant = await _db.ProductVariants.FindAsync(item.ProductVariantId.Value);
                    if (variant != null)
                    {
                        variant.StockQuantity += item.Quantity;
                    }
                }
            }
            order.CancellationReason = string.IsNullOrWhiteSpace(request.CancellationReason) 
                ? "Declined by store administrator" 
                : request.CancellationReason.Trim();
        }
        else if (previousStatus == OrderStatus.Cancelled && request.Status != OrderStatus.Cancelled)
        {
            // Re-deduct inventory
            foreach (var item in order.Items)
            {
                if (item.ProductVariantId.HasValue)
                {
                    var variant = await _db.ProductVariants.FindAsync(item.ProductVariantId.Value);
                    if (variant != null)
                    {
                        variant.StockQuantity = Math.Max(0, variant.StockQuantity - item.Quantity);
                    }
                }
            }
            order.CancellationReason = null;
        }
        else if (request.Status != OrderStatus.Cancelled)
        {
            order.CancellationReason = null;
        }

        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { 
            message = $"Order status updated to {request.Status}", 
            status = order.Status.ToString(),
            cancellationReason = order.CancellationReason 
        });
    }
}
