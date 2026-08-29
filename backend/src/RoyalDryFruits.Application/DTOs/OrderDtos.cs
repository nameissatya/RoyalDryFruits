using RoyalDryFruits.Domain.Enums;

namespace RoyalDryFruits.Application.DTOs;

public class OrderItemDto
{
    public Guid Id { get; set; }
    public Guid? ProductVariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string WeightLabel { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
}

public class OrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;

    public decimal SubTotal { get; set; }
    public decimal DeliveryCharge { get; set; }
    public decimal TotalAmount { get; set; }

    public OrderStatus Status { get; set; }
    public string StatusLabel => Status.ToString();
    public string? CancellationReason { get; set; }
    public string PaymentMethod { get; set; } = "COD";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public List<OrderItemDto> Items { get; set; } = new();
}

public class UpdateOrderStatusRequest
{
    public OrderStatus Status { get; set; }
    public string? CancellationReason { get; set; }
}

public class CreateOrderItemRequest
{
    public Guid? ProductVariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string WeightLabel { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
}

public class CreateOrderRequest
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = "COD";
    public decimal DeliveryCharge { get; set; } = 0;
    public List<CreateOrderItemRequest> Items { get; set; } = new();
}
