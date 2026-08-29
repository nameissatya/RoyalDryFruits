using RoyalDryFruits.Application.DTOs;
using RoyalDryFruits.Domain.Entities;
using RoyalDryFruits.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace RoyalDryFruits.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public SettingsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _db.StoreSettings.FirstOrDefaultAsync();
        if (settings == null)
        {
            return Ok(new StoreSettingsDto());
        }

        return Ok(new StoreSettingsDto
        {
            Id = settings.Id,
            StoreName = settings.StoreName,
            Phone = settings.Phone,
            Address = settings.Address,
            Email = settings.Email,
            Latitude = settings.Latitude,
            Longitude = settings.Longitude,
            FreeDeliveryRadius = settings.FreeDeliveryRadius,
            DeliveryRadius = settings.DeliveryRadius,
            DeliveryCharge = settings.DeliveryCharge,
            MinOrderValue = settings.MinOrderValue,
            FreeDeliveryThreshold = settings.FreeDeliveryThreshold
        });
    }
}
