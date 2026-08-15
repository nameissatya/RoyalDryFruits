using RoyalDryFruits.Application.Features.Authentication.DTOs;

namespace RoyalDryFruits.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);

    Task<AuthResponse> RegisterUserAsync(RegisterRequest request);
    Task<AuthResponse> LoginUserAsync(LoginRequest request);
    
    Task<AuthResponse> SendOtpAsync(SendOtpRequest request);
    Task<AuthResponse> VerifyOtpAsync(VerifyOtpRequest request);

    Task<AuthResponse> RegisterAdminAsync(AdminRegisterRequest request);
    Task<AuthResponse> LoginAdminAsync(LoginRequest request);
}