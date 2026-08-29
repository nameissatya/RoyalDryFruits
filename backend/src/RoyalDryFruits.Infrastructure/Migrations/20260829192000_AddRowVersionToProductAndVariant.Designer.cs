using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using RoyalDryFruits.Infrastructure.Persistence;

#nullable disable

namespace RoyalDryFruits.Infrastructure.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260829192000_AddRowVersionToProductAndVariant")]
    partial class AddRowVersionToProductAndVariant
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "7.0.0");

            // Intentionally minimal designer for a single-column migration.
        }
    }
}
