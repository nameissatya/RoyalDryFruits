using RoyalDryFruits.Application.DTOs;
using RoyalDryFruits.Domain.Entities;
using RoyalDryFruits.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace RoyalDryFruits.API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
public class AdminSettingsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminSettingsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _db.StoreSettings.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = new StoreSettings();
            _db.StoreSettings.Add(settings);
            await _db.SaveChangesAsync();
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
            DeliveryCharge = settings.DeliveryCharge,
            MinOrderValue = settings.MinOrderValue,
            FreeDeliveryThreshold = settings.FreeDeliveryThreshold
        });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateStoreSettingsRequest request)
    {
        var settings = await _db.StoreSettings.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = new StoreSettings();
            _db.StoreSettings.Add(settings);
        }

        settings.StoreName = request.StoreName;
        settings.Phone = request.Phone;
        settings.Address = request.Address;
        settings.Email = request.Email;
        settings.Latitude = request.Latitude;
        settings.Longitude = request.Longitude;
        settings.DeliveryCharge = request.DeliveryCharge;
        settings.MinOrderValue = request.MinOrderValue;
        settings.FreeDeliveryThreshold = request.FreeDeliveryThreshold;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Store settings updated successfully" });
    }
}
