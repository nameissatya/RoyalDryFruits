using Microsoft.EntityFrameworkCore;
using RoyalDryFruits.Infrastructure.Persistence;
using Scalar.AspNetCore;
using RoyalDryFruits.Infrastructure.Extensions;
using RoyalDryFruits.API.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using CloudinaryDotNet;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory
});

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://*:{port}");
}

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

// Configure Cloudinary for permanent image storage across server restarts
var cloudName = builder.Configuration["Cloudinary:CloudName"] ?? Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME") ?? "kj2scw6k";
var apiKey = builder.Configuration["Cloudinary:ApiKey"] ?? Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY") ?? "272153177269493";
var apiSecret = builder.Configuration["Cloudinary:ApiSecret"] ?? Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET") ?? "3aNzvbptC7_8LN5nl8ucmV8ieow";

var cloudinaryAccount = new Account(cloudName, apiKey, apiSecret);
var cloudinary = new Cloudinary(cloudinaryAccount);
cloudinary.Api.Secure = true;
builder.Services.AddSingleton(cloudinary);

builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddInfrastructureServices();
// Build connection string - handle Render's postgres:// URL format
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(connectionString) && connectionString.StartsWith("postgres"))
{
    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':');
    var dbPort = uri.Port > 0 ? uri.Port : 5432;
    connectionString = $"Host={uri.Host};Port={dbPort};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

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

// Automatically apply database migrations and tables safely without deleting data
try
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        try
        {
            // Apply pending EF Core migrations
            db.Database.Migrate();
        }
        catch (Exception migrateEx)
        {
            Console.WriteLine($"Database migration notice: {migrateEx.Message}. Ensuring tables exist without destructive deletion.");
            // EnsureCreated only creates tables if they don't exist; it NEVER deletes existing tables or data
            try
            {
                db.Database.EnsureCreated();
            }
            catch (Exception ensureEx)
            {
                Console.WriteLine($"EnsureCreated notice: {ensureEx.Message}");
            }
        }
        
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

// Health check endpoint - pinged every 14 mins to keep Render free tier alive
app.MapGet("/health", () => Results.Ok(new { 
    status = "healthy", 
    timestamp = DateTime.UtcNow 
}));

app.MapControllers();

app.Run();
