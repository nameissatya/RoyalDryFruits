namespace RoyalDryFruits.Application.DTOs;

public class ProductVariantDto
{
    public Guid Id { get; set; }
    public string WeightLabel { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string SKU { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class CreateProductVariantRequest
{
    public string WeightLabel { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string SKU { get; set; } = string.Empty;
}

public class ProductDto
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;
    public string Badge { get; set; } = string.Empty;
    public double Rating { get; set; } = 4.8;
    public int ReviewsCount { get; set; } = 120;
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public DateTime CreatedAt { get; set; }

    public List<ProductVariantDto> Variants { get; set; } = new();
}

public class CreateProductRequest
{
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;
    public string Badge { get; set; } = string.Empty;
    public double Rating { get; set; } = 4.8;
    public int ReviewsCount { get; set; } = 120;
    public bool IsFeatured { get; set; }

    public List<CreateProductVariantRequest> Variants { get; set; } = new();
}

public class UpdateProductRequest
{
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;
    public string Badge { get; set; } = string.Empty;
    public double Rating { get; set; } = 4.8;
    public int ReviewsCount { get; set; } = 120;
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }

    public List<ProductVariantDto> Variants { get; set; } = new();
}
