namespace RoyalDryFruits.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public bool IsPhoneVerified { get; set; } = false;

    public string? GoogleId { get; set; }

    public string? ProfilePictureUrl { get; set; }

    public string? PasswordHash { get; set; }

    public int FailedLoginAttempts { get; set; } = 0;

    public DateTime? LockoutEndUtc { get; set; }

    public DateTime? LastLoginAt { get; set; }

    public bool IsActive { get; set; } = true;

    public bool MustChangePin { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}