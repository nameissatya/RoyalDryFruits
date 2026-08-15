namespace RoyalDryFruits.Application.Features.Authentication.DTOs;

public class VerifyOtpRequest
{
    public string Phone { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
    public string? FullName { get; set; }
}
