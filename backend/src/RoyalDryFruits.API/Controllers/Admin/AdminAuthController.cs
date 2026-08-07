using RoyalDryFruits.Application.Features.Authentication.DTOs;
using RoyalDryFruits.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace RoyalDryFruits.API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
public class AdminAuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AdminAuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await _authService.LoginAdminAsync(request);
        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(AdminRegisterRequest request)
    {
        var result = await _authService.RegisterAdminAsync(request);
        return Ok(result);
    }
}
