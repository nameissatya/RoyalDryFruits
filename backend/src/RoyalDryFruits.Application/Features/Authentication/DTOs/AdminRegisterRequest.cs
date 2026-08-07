namespace RoyalDryFruits.Application.Features.Authentication.DTOs;

public class AdminRegisterRequest
{
    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}
