using RoyalDryFruits.Application.DTOs;
using RoyalDryFruits.Domain.Entities;
using RoyalDryFruits.Domain.Enums;
using RoyalDryFruits.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace RoyalDryFruits.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public OrdersController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest req)
    {
        if (req == null || req.Items == null || !req.Items.Any())
        {
            return BadRequest(new { message = "Order must contain at least one item." });
        }

        if (string.IsNullOrWhiteSpace(req.CustomerName) || string.IsNullOrWhiteSpace(req.CustomerPhone))
        {
            return BadRequest(new { message = "Customer name and phone number are required." });
        }

        var orderNumber = "#RDF-" + Random.Shared.Next(10000, 99999);

        var subTotal = req.Items.Sum(i => i.UnitPrice * i.Quantity);
        var totalAmount = subTotal + req.DeliveryCharge;

        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = orderNumber,
            CustomerName = req.CustomerName.Trim(),
            CustomerPhone = req.CustomerPhone.Trim(),
            CustomerEmail = req.CustomerEmail?.Trim() ?? string.Empty,
            DeliveryAddress = req.DeliveryAddress?.Trim() ?? string.Empty,
            PaymentMethod = string.IsNullOrWhiteSpace(req.PaymentMethod) ? "COD" : req.PaymentMethod.Trim(),
            SubTotal = subTotal,
            DeliveryCharge = req.DeliveryCharge,
            TotalAmount = totalAmount,
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            Items = new List<OrderItem>()
        };

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
            CreatedAt = order.CreatedAt,
            Items = order.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductVariantId = i.ProductVariantId,
                ProductName = i.ProductName,
                WeightLabel = i.WeightLabel,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                TotalPrice = i.TotalPrice
            }).ToList()
        };

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, responseDto);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _db.Orders
            .Include(x => x.Items)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        var dtos = orders.Select(o => new OrderDto
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
            Items = o.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductVariantId = i.ProductVariantId,
                ProductName = i.ProductName,
                WeightLabel = i.WeightLabel,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                TotalPrice = i.TotalPrice
            }).ToList()
        }).ToList();

        return Ok(dtos);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var o = await _db.Orders
            .Include(x => x.Items)
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
            Items = o.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductVariantId = i.ProductVariantId,
                ProductName = i.ProductName,
                WeightLabel = i.WeightLabel,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                TotalPrice = i.TotalPrice
            }).ToList()
        });
    }

    [HttpGet("number/{orderNumber}")]
    public async Task<IActionResult> GetByOrderNumber(string orderNumber)
    {
        var o = await _db.Orders
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.OrderNumber == orderNumber || x.OrderNumber == "#" + orderNumber);

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
            Items = o.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductVariantId = i.ProductVariantId,
                ProductName = i.ProductName,
                WeightLabel = i.WeightLabel,
                UnitPrice = i.UnitPrice,
            }).ToList()
        });
    }

    [HttpGet("phone/{phone}")]
    public async Task<IActionResult> GetByPhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return Ok(new List<OrderDto>());

        var digits = new string(phone.Where(char.IsDigit).ToArray());
        var last10 = digits.Length >= 10 ? digits.Substring(digits.Length - 10) : digits;

        var allOrders = await _db.Orders
            .Include(x => x.Items)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        var orders = string.IsNullOrEmpty(last10)
            ? allOrders
            : allOrders.Where(o => {
                var pDigits = new string((o.CustomerPhone ?? "").Where(char.IsDigit).ToArray());
                return pDigits.Contains(last10);
            }).ToList();

        var dtos = orders.Select(o => new OrderDto
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
            Items = o.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductVariantId = i.ProductVariantId,
                ProductName = i.ProductName,
                WeightLabel = i.WeightLabel,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                TotalPrice = i.TotalPrice
            }).ToList()
        }).ToList();

        return Ok(dtos);
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest req)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(x => x.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        order.Status = req.Status;
        if (!string.IsNullOrWhiteSpace(req.CancellationReason))
        {
            order.CancellationReason = req.CancellationReason.Trim();
        }
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Order status updated successfully", status = order.Status, cancellationReason = order.CancellationReason });
    }
}
