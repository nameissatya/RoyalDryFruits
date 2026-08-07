using RoyalDryFruits.Application.DTOs;
using RoyalDryFruits.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace RoyalDryFruits.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ProductsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category, [FromQuery] string? search, [FromQuery] bool? featured)
    {
        var query = _db.Products
            .Include(p => p.Category)
            .Include(p => p.Variants)
            .Where(p => p.IsActive);

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(p => p.Category != null && 
                (p.Category.Slug.ToLower() == category.ToLower() || p.Category.Name.ToLower() == category.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(searchLower) || p.Description.ToLower().Contains(searchLower));
        }

        if (featured.HasValue && featured.Value)
        {
            query = query.Where(p => p.IsFeatured);
        }

        var products = await query
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                CategoryId = p.CategoryId,
                CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                Name = p.Name,
                Slug = p.Slug,
                Description = p.Description,
                ImageUrl = p.ImageUrl,
                Origin = p.Origin,
                Badge = p.Badge,
                Rating = p.Rating > 0 ? p.Rating : 4.8,
                ReviewsCount = p.ReviewsCount > 0 ? p.ReviewsCount : 120,
                IsActive = p.IsActive,
                IsFeatured = p.IsFeatured,
                CreatedAt = p.CreatedAt,
                Variants = p.Variants.Where(v => v.IsActive).Select(v => new ProductVariantDto
                {
                    Id = v.Id,
                    WeightLabel = v.WeightLabel,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity,
                    SKU = v.SKU,
                    IsActive = v.IsActive
                }).ToList()
            })
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var p = await _db.Products
            .Include(x => x.Category)
            .Include(x => x.Variants)
            .FirstOrDefaultAsync(x => x.Id == id && x.IsActive);

        if (p == null) return NotFound(new { message = "Product not found" });

        return Ok(new ProductDto
        {
            Id = p.Id,
            CategoryId = p.CategoryId,
            CategoryName = p.Category != null ? p.Category.Name : string.Empty,
            Name = p.Name,
            Slug = p.Slug,
            Description = p.Description,
            ImageUrl = p.ImageUrl,
            Origin = p.Origin,
            Badge = p.Badge,
            Rating = p.Rating > 0 ? p.Rating : 4.8,
            ReviewsCount = p.ReviewsCount > 0 ? p.ReviewsCount : 120,
            IsActive = p.IsActive,
            IsFeatured = p.IsFeatured,
            CreatedAt = p.CreatedAt,
            Variants = p.Variants.Where(v => v.IsActive).Select(v => new ProductVariantDto
            {
                Id = v.Id,
                WeightLabel = v.WeightLabel,
                Price = v.Price,
                StockQuantity = v.StockQuantity,
                SKU = v.SKU,
                IsActive = v.IsActive
            }).ToList()
        });
    }

    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var p = await _db.Products
            .Include(x => x.Category)
            .Include(x => x.Variants)
            .FirstOrDefaultAsync(x => x.Slug.ToLower() == slug.ToLower() && x.IsActive);

        if (p == null) return NotFound(new { message = "Product not found" });

        return Ok(new ProductDto
        {
            Id = p.Id,
            CategoryId = p.CategoryId,
            CategoryName = p.Category != null ? p.Category.Name : string.Empty,
            Name = p.Name,
            Slug = p.Slug,
            Description = p.Description,
            ImageUrl = p.ImageUrl,
            Origin = p.Origin,
            Badge = p.Badge,
            Rating = p.Rating > 0 ? p.Rating : 4.8,
            ReviewsCount = p.ReviewsCount > 0 ? p.ReviewsCount : 120,
            IsActive = p.IsActive,
            IsFeatured = p.IsFeatured,
            CreatedAt = p.CreatedAt,
            Variants = p.Variants.Where(v => v.IsActive).Select(v => new ProductVariantDto
            {
                Id = v.Id,
                WeightLabel = v.WeightLabel,
                Price = v.Price,
                StockQuantity = v.StockQuantity,
                SKU = v.SKU,
                IsActive = v.IsActive
            }).ToList()
        });
    }
}
