using RoyalDryFruits.Application.Features.Authentication.DTOs;

namespace RoyalDryFruits.Application.Interfaces;

public interface IAuthService
{
    // Mobile Number + PIN Authentication
    Task<AuthResponse> RegisterWithPinAsync(CustomerRegisterWithPinRequest request);
    Task<AuthResponse> LoginWithPinAsync(CustomerPinLoginRequest request);
    Task<AuthResponse> ChangePinAsync(ChangePinRequest request);
    Task<ForgotPinInfoResponse> GetForgotPinInfoAsync(string phone);

    // Admin Customer & PIN Management
    Task<List<CustomerUserDto>> GetCustomersForAdminAsync(string? query = null);
    Task<bool> AdminResetCustomerPinAsync(Guid userId, string newPin);
    Task<bool> AdminUnlockCustomerAsync(Guid userId);

    // Legacy & Admin Auth
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterUserAsync(RegisterRequest request);
    Task<AuthResponse> LoginUserAsync(LoginRequest request);
    Task<AuthResponse> SendOtpAsync(SendOtpRequest request);
    Task<AuthResponse> VerifyOtpAsync(VerifyOtpRequest request);
    Task<AuthResponse> RegisterAdminAsync(AdminRegisterRequest request);
    Task<AuthResponse> LoginAdminAsync(LoginRequest request);
}