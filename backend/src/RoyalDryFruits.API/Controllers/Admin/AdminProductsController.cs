using RoyalDryFruits.Application.DTOs;
using RoyalDryFruits.Domain.Entities;
using RoyalDryFruits.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace RoyalDryFruits.API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
public class AdminProductsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminProductsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products = await _db.Products
            .Include(p => p.Category)
            .Include(p => p.Variants)
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
                Variants = p.Variants.Select(v => new ProductVariantDto
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
            .FirstOrDefaultAsync(x => x.Id == id);

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
            Variants = p.Variants.Select(v => new ProductVariantDto
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

    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No image file uploaded" });

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            return BadRequest(new { message = "Invalid image extension. Only JPG, PNG, WEBP allowed." });

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "products");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = $"{Guid.NewGuid():N}_{Path.GetFileNameWithoutExtension(file.FileName)}{ext}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var relativeUrl = $"/uploads/products/{uniqueFileName}";
        return Ok(new { imageUrl = relativeUrl, fileName = uniqueFileName });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Product name is required" });

        var category = await _db.Categories.FindAsync(request.CategoryId);
        if (category == null)
            return BadRequest(new { message = "Invalid Category ID" });

        var product = new Product
        {
            CategoryId = request.CategoryId,
            Name = request.Name,
            Slug = request.Name.ToLower().Replace(" ", "-"),
            Description = request.Description,
            ImageUrl = request.ImageUrl,
            Origin = request.Origin,
            Badge = request.Badge,
            Rating = request.Rating > 0 ? request.Rating : 4.8,
            ReviewsCount = request.ReviewsCount > 0 ? request.ReviewsCount : 120,
            IsFeatured = request.IsFeatured,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        if (request.Variants != null && request.Variants.Any())
        {
            foreach (var v in request.Variants)
            {
                product.Variants.Add(new ProductVariant
                {
                    WeightLabel = v.WeightLabel,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity,
                    SKU = string.IsNullOrWhiteSpace(v.SKU) ? $"PRD-{Random.Shared.Next(1000, 9999)}" : v.SKU,
                    IsActive = true
                });
            }
        }

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, new { message = "Product created successfully", id = product.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest request)
    {
        var product = await _db.Products
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null) return NotFound(new { message = "Product not found" });

        if (request.CategoryId != Guid.Empty)
        {
            var category = await _db.Categories.FindAsync(request.CategoryId);
            if (category != null)
            {
                product.CategoryId = request.CategoryId;
            }
        }

        product.Name = request.Name;
        product.Slug = !string.IsNullOrWhiteSpace(request.Name) 
            ? request.Name.ToLower().Trim().Replace(" ", "-") 
            : product.Slug;
        product.Description = request.Description ?? string.Empty;
        product.ImageUrl = request.ImageUrl ?? string.Empty;
        product.Origin = request.Origin ?? string.Empty;
        product.Badge = request.Badge ?? string.Empty;
        product.Rating = request.Rating > 0 ? request.Rating : 4.8;
        product.ReviewsCount = request.ReviewsCount >= 0 ? request.ReviewsCount : 0;
        product.IsActive = request.IsActive;
        product.IsFeatured = request.IsFeatured;

        // Synchronize Variants safely
        if (request.Variants != null && request.Variants.Any())
        {
            var requestedVariantIds = request.Variants
                .Where(v => v.Id != Guid.Empty)
                .Select(v => v.Id)
                .ToHashSet();

            // 1. Remove variants that were deleted in the editor
            var variantsToRemove = product.Variants
                .Where(v => !requestedVariantIds.Contains(v.Id))
                .ToList();

            foreach (var v in variantsToRemove)
            {
                _db.ProductVariants.Remove(v);
            }

            // 2. Update existing variants or add newly created ones
            foreach (var vDto in request.Variants)
            {
                ProductVariant? existingVariant = null;
                if (vDto.Id != Guid.Empty)
                {
                    existingVariant = product.Variants.FirstOrDefault(v => v.Id == vDto.Id);
                }

                if (existingVariant != null)
                {
                    existingVariant.WeightLabel = vDto.WeightLabel ?? string.Empty;
                    existingVariant.Price = vDto.Price;
                    existingVariant.StockQuantity = vDto.StockQuantity;
                    existingVariant.SKU = string.IsNullOrWhiteSpace(vDto.SKU) ? existingVariant.SKU : vDto.SKU;
                    existingVariant.IsActive = vDto.IsActive;
                }
                else
                {
                    // Add new variant
                    var newVar = new ProductVariant
                    {
                        Id = vDto.Id != Guid.Empty ? vDto.Id : Guid.NewGuid(),
                        ProductId = product.Id,
                        WeightLabel = vDto.WeightLabel ?? string.Empty,
                        Price = vDto.Price,
                        StockQuantity = vDto.StockQuantity,
                        SKU = string.IsNullOrWhiteSpace(vDto.SKU) ? $"PRD-{Random.Shared.Next(1000, 9999)}" : vDto.SKU,
                        IsActive = vDto.IsActive
                    };
                    product.Variants.Add(newVar);
                }
            }
        }

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            // Resolve optimistic concurrency conflicts by detaching phantom rows and reloading actual state
            foreach (var entry in ex.Entries)
            {
                if (entry.State == EntityState.Deleted)
                {
                    entry.State = EntityState.Detached;
                }
                else
                {
                    await entry.ReloadAsync();
                }
            }
            await _db.SaveChangesAsync();
        }

        return Ok(new { message = "Product updated successfully", id = product.Id });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var product = await _db.Products
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null) return NotFound(new { message = "Product not found" });

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Product deleted successfully" });
    }
}
