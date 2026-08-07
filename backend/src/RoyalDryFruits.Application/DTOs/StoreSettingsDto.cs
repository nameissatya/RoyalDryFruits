namespace RoyalDryFruits.Application.DTOs;

public class StoreSettingsDto
{
    public Guid Id { get; set; }
    public string StoreName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public decimal DeliveryCharge { get; set; }
    public decimal MinOrderValue { get; set; }
    public decimal FreeDeliveryThreshold { get; set; }
}

public class UpdateStoreSettingsRequest
{
    public string StoreName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public decimal DeliveryCharge { get; set; }
    public decimal MinOrderValue { get; set; }
    public decimal FreeDeliveryThreshold { get; set; }
}
