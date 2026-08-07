using Microsoft.EntityFrameworkCore;
using RoyalDryFruits.Infrastructure.Persistence;
using Scalar.AspNetCore;
using RoyalDryFruits.Infrastructure.Extensions;
using RoyalDryFruits.API.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory
});

// Bind dynamically to PORT env variable assigned by Render container
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://*:{port}");

// Add CORS Policy for Frontend Portals (Admin & Storefront)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendPortals", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddInfrastructureServices();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

builder.Services.AddOpenApi();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    builder.Configuration["Jwt:Key"]!
                ))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Global Production Exception Middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

// Automatically create database and tables if they don't exist
try
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.EnsureCreated();
        await DbInitializer.SeedAsync(db);
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Database initialization notice: {ex.Message}");
}

app.UseCors("AllowFrontendPortals");

// Enable serving static files from wwwroot/
app.UseStaticFiles();

app.MapOpenApi();
app.MapScalarApiReference();

app.UseAuthentication();
app.UseAuthorization();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.MapGet("/", () => Results.Ok(new { 
    status = "Online", 
    service = "Royal Dry Fruits Backend Web API", 
    timestamp = DateTime.UtcNow,
    swagger = "/scalar/v1" 
}));

app.MapGet("/api", () => Results.Ok(new { status = "Online", service = "Royal Dry Fruits API" }));

app.MapControllers();

app.Run();
