using RoyalDryFruits.Application.DTOs;
using RoyalDryFruits.Domain.Entities;
using RoyalDryFruits.Domain.Enums;
using RoyalDryFruits.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace RoyalDryFruits.API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
public class AdminOrdersController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminOrdersController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
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

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var productImages = await GetProductImageLookupAsync();

        var o = await _db.Orders
            .Include(x => x.Items)
                .ThenInclude(i => i.ProductVariant!)
                    .ThenInclude(pv => pv.Product)
            .FirstOrDefaultAsync(x => x.Id == id);

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

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order == null) return NotFound(new { message = "Order not found" });

        order.Status = request.Status;
        if (request.Status == OrderStatus.Cancelled)
        {
            order.CancellationReason = string.IsNullOrWhiteSpace(request.CancellationReason) 
                ? "Declined by store administrator" 
                : request.CancellationReason.Trim();
        }
        else
        {
            order.CancellationReason = null; // Clear if transitioned back from cancelled
        }
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { 
            message = $"Order status updated to {request.Status}", 
            status = request.Status.ToString(),
            cancellationReason = order.CancellationReason 
        });
    }
}
