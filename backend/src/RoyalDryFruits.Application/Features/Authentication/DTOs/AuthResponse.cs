namespace RoyalDryFruits.Application.Features.Authentication.DTOs;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Name { get; set; }

    public string Role { get; set; } = string.Empty;

    public bool MustChangePin { get; set; } = false;
}