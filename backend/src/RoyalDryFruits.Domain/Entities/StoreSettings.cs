namespace RoyalDryFruits.Domain.Entities;

public class StoreSettings
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string StoreName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public double Latitude { get; set; } = 0;
    public double Longitude { get; set; } = 0;
    public double FreeDeliveryRadius { get; set; } = 0;
    public double DeliveryRadius { get; set; } = 0;
    public decimal DeliveryCharge { get; set; } = 0;
    public decimal MinOrderValue { get; set; } = 0;
    public decimal FreeDeliveryThreshold { get; set; } = 0;
}

