using RoyalDryFruits.Application.Features.Authentication.DTOs;
using RoyalDryFruits.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace RoyalDryFruits.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Register a new customer with Name, Mobile Number, and 4/6-digit PIN
    /// </summary>
    [HttpPost("register-pin")]
    public async Task<IActionResult> RegisterWithPin([FromBody] CustomerRegisterWithPinRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var result = await _authService.RegisterWithPinAsync(request);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Sign in an existing customer using Mobile Number + PIN
    /// </summary>
    [HttpPost("login-pin")]
    public async Task<IActionResult> LoginWithPin([FromBody] CustomerPinLoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var result = await _authService.LoginWithPinAsync(request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(429, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update/reset PIN using temporary or current PIN
    /// </summary>
    [HttpPost("change-pin")]
    public async Task<IActionResult> ChangePin([FromBody] ChangePinRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var result = await _authService.ChangePinAsync(request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(429, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get help and support contact options for Forgot PIN
    /// </summary>
    [HttpGet("forgot-pin/{phone}")]
    public async Task<IActionResult> GetForgotPinInfo(string phone)
    {
        var result = await _authService.GetForgotPinInfoAsync(phone);
        return Ok(result);
    }

    // ==========================================
    // BACKWARD COMPATIBLE & LEGACY ENDPOINTS
    // ==========================================

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var result = await _authService.RegisterUserAsync(request);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await _authService.LoginUserAsync(request);
        return Ok(result);
    }

    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp(SendOtpRequest request)
    {
        var result = await _authService.SendOtpAsync(request);
        return Ok(result);
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp(VerifyOtpRequest request)
    {
        var result = await _authService.VerifyOtpAsync(request);
        return Ok(result);
    }
}