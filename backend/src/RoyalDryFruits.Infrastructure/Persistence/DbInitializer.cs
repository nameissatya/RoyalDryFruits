using Microsoft.EntityFrameworkCore;

namespace RoyalDryFruits.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext db)
    {
        // Ensure missing columns exist in database tables without inserting dummy or temporary data
        try
        {
            await db.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE ""Products"" ADD COLUMN IF NOT EXISTS ""Badge"" text NOT NULL DEFAULT '';
                ALTER TABLE ""Products"" ADD COLUMN IF NOT EXISTS ""Rating"" double precision NOT NULL DEFAULT 0.0;
                ALTER TABLE ""Products"" ADD COLUMN IF NOT EXISTS ""ReviewsCount"" integer NOT NULL DEFAULT 0;
                ALTER TABLE ""OrderItems"" ALTER COLUMN ""ProductVariantId"" DROP NOT NULL;
                ALTER TABLE ""Orders"" ADD COLUMN IF NOT EXISTS ""CancellationReason"" text;
            ");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Schema migration note: {ex.Message}");
        }

        // No seed products, categories, or store details are inserted.
        // The shop owner will add their real categories, products, and settings manually through the Admin Portal.
    }
}
