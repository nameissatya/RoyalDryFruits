using System.ComponentModel.DataAnnotations;

namespace RoyalDryFruits.Application.Features.Authentication.DTOs;

public class CustomerPinLoginRequest
{
    [Required]
    [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Please enter a valid 10-digit Indian mobile number.")]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{4,6}$", ErrorMessage = "PIN must be 4 to 6 numeric digits.")]
    public string Pin { get; set; } = string.Empty;
}

public class CustomerRegisterWithPinRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Full Name must be between 2 and 100 characters.")]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Please enter a valid 10-digit Indian mobile number.")]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{4,6}$", ErrorMessage = "PIN must be 4 to 6 numeric digits.")]
    public string Pin { get; set; } = string.Empty;
}

public class AdminResetPinRequest
{
    [Required]
    [RegularExpression(@"^\d{4,6}$", ErrorMessage = "New PIN must be 4 to 6 numeric digits.")]
    public string NewPin { get; set; } = string.Empty;
}

public class ChangePinRequest
{
    [Required]
    [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Please enter a valid 10-digit Indian mobile number.")]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{4,6}$", ErrorMessage = "Old/Temporary PIN must be 4 to 6 numeric digits.")]
    public string OldPin { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{4,6}$", ErrorMessage = "New PIN must be 4 to 6 numeric digits.")]
    public string NewPin { get; set; } = string.Empty;
}

public class ForgotPinInfoResponse
{
    public string Phone { get; set; } = string.Empty;
    public string SupportPhone { get; set; } = string.Empty;
    public string SupportWhatsApp { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRegistered { get; set; } = false;
}

public class CustomerUserDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public int FailedLoginAttempts { get; set; }
    public bool IsLocked { get; set; }
    public DateTime? LockoutEndUtc { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public int OrdersCount { get; set; }
    public decimal TotalSpent { get; set; }
}
