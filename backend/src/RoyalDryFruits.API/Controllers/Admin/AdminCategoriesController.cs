using RoyalDryFruits.Application.DTOs;
using RoyalDryFruits.Domain.Entities;
using RoyalDryFruits.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace RoyalDryFruits.API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
public class AdminCategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminCategoriesController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _db.Categories
            .Include(c => c.Products)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description,
                Icon = c.Icon,
                IsActive = c.IsActive,
                ProductCount = c.Products.Count,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var c = await _db.Categories
            .Include(x => x.Products)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (c == null) return NotFound(new { message = "Category not found" });

        return Ok(new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug,
            Description = c.Description,
            Icon = c.Icon,
            IsActive = c.IsActive,
            ProductCount = c.Products.Count,
            CreatedAt = c.CreatedAt
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Category name is required" });

        var category = new Category
        {
            Name = request.Name,
            Slug = request.Name.ToLower().Replace(" ", "-"),
            Description = request.Description,
            Icon = string.IsNullOrWhiteSpace(request.Icon) ? "folder" : request.Icon,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.Categories.Add(category);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = category.Id }, new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            Icon = category.Icon,
            IsActive = category.IsActive,
            ProductCount = 0,
            CreatedAt = category.CreatedAt
        });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryRequest request)
    {
        var category = await _db.Categories.FindAsync(id);
        if (category == null) return NotFound(new { message = "Category not found" });

        category.Name = request.Name;
        category.Slug = request.Name.ToLower().Replace(" ", "-");
        category.Description = request.Description;
        category.Icon = request.Icon;
        category.IsActive = request.IsActive;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Category updated successfully" });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var category = await _db.Categories.FindAsync(id);
        if (category == null) return NotFound(new { message = "Category not found" });

        _db.Categories.Remove(category);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Category deleted successfully" });
    }
}
