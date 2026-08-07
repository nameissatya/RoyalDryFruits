using RoyalDryFruits.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace RoyalDryFruits.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext db)
    {
        // 0. Ensure missing columns are added to Products table if database already existed
        try
        {
            await db.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE ""Products"" ADD COLUMN IF NOT EXISTS ""Badge"" text NOT NULL DEFAULT '';
                ALTER TABLE ""Products"" ADD COLUMN IF NOT EXISTS ""Rating"" double precision NOT NULL DEFAULT 4.8;
                ALTER TABLE ""Products"" ADD COLUMN IF NOT EXISTS ""ReviewsCount"" integer NOT NULL DEFAULT 120;
                ALTER TABLE ""OrderItems"" ALTER COLUMN ""ProductVariantId"" DROP NOT NULL;
                ALTER TABLE ""Orders"" ADD COLUMN IF NOT EXISTS ""CancellationReason"" text;
            ");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Schema migration note: {ex.Message}");
        }

        // 1. Ensure Categories exist or create missing ones
        var catNuts = await EnsureCategoryAsync(db, "Nuts & Almonds", "nuts-almonds", "Premium fresh nuts and almond varieties", "nut");
        var catCashews = await EnsureCategoryAsync(db, "Cashews & Pistachios", "cashews-pistachios", "Whole cashews and crisp Afghan pistachios", "sparkles");
        var catDates = await EnsureCategoryAsync(db, "Dried Fruits & Dates", "dried-fruits-dates", "Fresh Medjool dates, raisins, figs and berries", "sun");
        var catHampers = await EnsureCategoryAsync(db, "Gift Hampers", "gift-hampers", "Luxury festive and corporate gift hampers", "gift");

        // 2. Ensure Products exist or insert missing ones
        await EnsureProductAsync(db, new Product
        {
            CategoryId = catNuts.Id,
            Name = "Premium California Almonds",
            Slug = "almond-california-500",
            Description = "Handpicked premium California almonds, packed with nutrition, crisp crunch, and rich taste.",
            ImageUrl = "/uploads/products/prod-almond-main.jpg",
            Origin = "California, USA",
            Badge = "Bestseller",
            Rating = 4.8,
            ReviewsCount = 128,
            IsActive = true,
            IsFeatured = true,
            Variants = new List<ProductVariant>
            {
                new ProductVariant { WeightLabel = "250g", Price = 350, StockQuantity = 50, SKU = "ALM-250" },
                new ProductVariant { WeightLabel = "500g", Price = 650, StockQuantity = 50, SKU = "ALM-500" },
                new ProductVariant { WeightLabel = "1kg", Price = 1250, StockQuantity = 30, SKU = "ALM-1000" }
            }
        });

        await EnsureProductAsync(db, new Product
        {
            CategoryId = catCashews.Id,
            Name = "Whole White Cashews (W320)",
            Slug = "cashew-w320-500",
            Description = "King-size W320 grade whole cashew nuts. Naturally sweet, creamy texture, perfect for healthy snacking.",
            ImageUrl = "/uploads/products/rel-cashews.jpg",
            Origin = "Mangalore, India",
            Badge = "Popular",
            Rating = 4.9,
            ReviewsCount = 94,
            IsActive = true,
            IsFeatured = true,
            Variants = new List<ProductVariant>
            {
                new ProductVariant { WeightLabel = "250g", Price = 380, StockQuantity = 40, SKU = "CSH-250" },
                new ProductVariant { WeightLabel = "500g", Price = 720, StockQuantity = 40, SKU = "CSH-500" },
                new ProductVariant { WeightLabel = "1kg", Price = 1380, StockQuantity = 20, SKU = "CSH-1000" }
            }
        });

        await EnsureProductAsync(db, new Product
        {
            CategoryId = catCashews.Id,
            Name = "Afghan Roasted Pistachios",
            Slug = "pistachios-afghan-500",
            Description = "Lightly salted and dry roasted Afghan pistachios with open shell. High protein and rich aroma.",
            ImageUrl = "/uploads/products/rel-pistachios.jpg",
            Origin = "Kabul, Afghanistan",
            Badge = "Salted",
            Rating = 4.7,
            ReviewsCount = 76,
            IsActive = true,
            IsFeatured = true,
            Variants = new List<ProductVariant>
            {
                new ProductVariant { WeightLabel = "250g", Price = 450, StockQuantity = 30, SKU = "PST-250" },
                new ProductVariant { WeightLabel = "500g", Price = 850, StockQuantity = 30, SKU = "PST-500" },
                new ProductVariant { WeightLabel = "1kg", Price = 1650, StockQuantity = 15, SKU = "PST-1000" }
            }
        });

        await EnsureProductAsync(db, new Product
        {
            CategoryId = catNuts.Id,
            Name = "Kashmiri Walnut Kernels",
            Slug = "walnut-kashmiri-250",
            Description = "Extra light half walnut kernels directly from Kashmiri orchards. Rich in Omega-3 fatty acids.",
            ImageUrl = "/uploads/products/rel-walnuts.jpg",
            Origin = "Kashmir, India",
            Badge = "Organic",
            Rating = 4.8,
            ReviewsCount = 52,
            IsActive = true,
            IsFeatured = false,
            Variants = new List<ProductVariant>
            {
                new ProductVariant { WeightLabel = "250g", Price = 550, StockQuantity = 25, SKU = "WLN-250" },
                new ProductVariant { WeightLabel = "500g", Price = 1050, StockQuantity = 25, SKU = "WLN-500" },
                new ProductVariant { WeightLabel = "1kg", Price = 1990, StockQuantity = 10, SKU = "WLN-1000" }
            }
        });

        await EnsureProductAsync(db, new Product
        {
            CategoryId = catDates.Id,
            Name = "Royal Medjool Dates",
            Slug = "dates-medjool-500",
            Description = "Large, soft, caramel-like natural Medjool dates. 100% natural with no added sugar or preservatives.",
            ImageUrl = "/uploads/products/cat-dates.jpg",
            Origin = "Jordan Valley",
            Badge = "Fresh Import",
            Rating = 4.9,
            ReviewsCount = 110,
            IsActive = true,
            IsFeatured = true,
            Variants = new List<ProductVariant>
            {
                new ProductVariant { WeightLabel = "250g", Price = 260, StockQuantity = 35, SKU = "DAT-250" },
                new ProductVariant { WeightLabel = "500g", Price = 490, StockQuantity = 35, SKU = "DAT-500" },
                new ProductVariant { WeightLabel = "1kg", Price = 920, StockQuantity = 20, SKU = "DAT-1000" }
            }
        });

        await EnsureProductAsync(db, new Product
        {
            CategoryId = catDates.Id,
            Name = "Jumbo Black Raisins",
            Slug = "raisins-black-500",
            Description = "Juicy black raisins packed with antioxidants and natural iron. Sweet and delicious.",
            ImageUrl = "/uploads/products/rel-raisins.jpg",
            Origin = "Nashik, India",
            Badge = "Sweet",
            Rating = 4.6,
            ReviewsCount = 43,
            IsActive = true,
            IsFeatured = false,
            Variants = new List<ProductVariant>
            {
                new ProductVariant { WeightLabel = "250g", Price = 190, StockQuantity = 50, SKU = "RSN-250" },
                new ProductVariant { WeightLabel = "500g", Price = 350, StockQuantity = 50, SKU = "RSN-500" },
                new ProductVariant { WeightLabel = "1kg", Price = 660, StockQuantity = 30, SKU = "RSN-1000" }
            }
        });

        await EnsureProductAsync(db, new Product
        {
            CategoryId = catHampers.Id,
            Name = "Artisanal Wooden Hamper",
            Slug = "hamper-artisanal-wooden",
            Description = "Handcrafted wooden box containing 4 premium dry fruit jars (Almonds, Cashews, Pistachios, Kishmish).",
            ImageUrl = "/uploads/products/hamper-artisanal.jpg",
            Origin = "Royal Curated",
            Badge = "Premium Gift",
            Rating = 5.0,
            ReviewsCount = 35,
            IsActive = true,
            IsFeatured = true,
            Variants = new List<ProductVariant>
            {
                new ProductVariant { WeightLabel = "1 Box", Price = 2499, StockQuantity = 15, SKU = "HMP-ART" }
            }
        });

        await EnsureProductAsync(db, new Product
        {
            CategoryId = catHampers.Id,
            Name = "Festive Celebration Box",
            Slug = "hamper-festive-box",
            Description = "Elegant festive hamper box with gold foil embossing, packed with premium assorted nuts and dry fruits.",
            ImageUrl = "/uploads/products/hamper-festive.jpg",
            Origin = "Royal Curated",
            Badge = "Festive Special",
            Rating = 4.9,
            ReviewsCount = 28,
            IsActive = true,
            IsFeatured = true,
            Variants = new List<ProductVariant>
            {
                new ProductVariant { WeightLabel = "1 Box", Price = 1899, StockQuantity = 20, SKU = "HMP-FST" }
            }
        });

        await EnsureProductAsync(db, new Product
        {
            CategoryId = catHampers.Id,
            Name = "Gold Tray Royal Hamper",
            Slug = "hamper-gold-tray",
            Description = "Royal gold plated serving tray filled with top-grade Iranian Pistachios, Jumbo Almonds & Anjeer.",
            ImageUrl = "/uploads/products/hamper-gold-tray.jpg",
            Origin = "Royal Curated",
            Badge = "Luxury Gift",
            Rating = 5.0,
            ReviewsCount = 42,
            IsActive = true,
            IsFeatured = true,
            Variants = new List<ProductVariant>
            {
                new ProductVariant { WeightLabel = "1 Box", Price = 3299, StockQuantity = 10, SKU = "HMP-GLD" }
            }
        });
    }

    private static async Task<Category> EnsureCategoryAsync(ApplicationDbContext db, string name, string slug, string description, string icon)
    {
        var existing = await db.Categories.FirstOrDefaultAsync(c => c.Slug.ToLower() == slug.ToLower() || c.Name.ToLower() == name.ToLower());
        if (existing != null) return existing;

        var cat = new Category
        {
            Id = Guid.NewGuid(),
            Name = name,
            Slug = slug,
            Description = description,
            Icon = icon,
            IsActive = true
        };
        await db.Categories.AddAsync(cat);
        await db.SaveChangesAsync();
        return cat;
    }

    private static async Task EnsureProductAsync(ApplicationDbContext db, Product product)
    {
        var existing = await db.Products.FirstOrDefaultAsync(p => p.Slug.ToLower() == product.Slug.ToLower() || p.Name.ToLower() == product.Name.ToLower());
        if (existing != null) return;

        product.Id = Guid.NewGuid();
        await db.Products.AddAsync(product);
        await db.SaveChangesAsync();
    }
}
