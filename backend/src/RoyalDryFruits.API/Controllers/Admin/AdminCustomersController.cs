using RoyalDryFruits.Application.Features.Authentication.DTOs;
using RoyalDryFruits.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace RoyalDryFruits.API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
public class AdminCustomersController : ControllerBase
{
    private readonly IAuthService _authService;

    public AdminCustomersController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCustomers([FromQuery] string? search)
    {
        var customers = await _authService.GetCustomersForAdminAsync(search);
        return Ok(customers);
    }

    [HttpPost("{id:guid}/reset-pin")]
    public async Task<IActionResult> ResetCustomerPin(Guid id, [FromBody] AdminResetPinRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            await _authService.AdminResetCustomerPinAsync(id, request.NewPin);
            return Ok(new { message = "Customer PIN successfully reset and account lockout cleared." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/unlock")]
    public async Task<IActionResult> UnlockCustomer(Guid id)
    {
        try
        {
            await _authService.AdminUnlockCustomerAsync(id);
            return Ok(new { message = "Customer account successfully unlocked." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
