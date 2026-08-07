namespace RoyalDryFruits.Domain.Entities;

public class StoreSettings
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string StoreName { get; set; } = "Royal Dry Fruits";
    public string Phone { get; set; } = "+91 98765 43210";
    public string Address { get; set; } = "123 Main Market, Mumbai, Maharashtra 400001";
    public string Email { get; set; } = "contact@royaldryfruits.com";
    public double Latitude { get; set; } = 18.9220;
    public double Longitude { get; set; } = 72.8347;
    public decimal DeliveryCharge { get; set; } = 50.00m;
    public decimal MinOrderValue { get; set; } = 500.00m;
    public decimal FreeDeliveryThreshold { get; set; } = 1500.00m;
}
