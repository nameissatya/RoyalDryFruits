using Microsoft.EntityFrameworkCore;
using RoyalDryFruits.Application.Features.Authentication.DTOs;
using RoyalDryFruits.Application.Interfaces;
using RoyalDryFruits.Domain.Entities;
using RoyalDryFruits.Infrastructure.Persistence;

namespace RoyalDryFruits.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _db;
    private readonly JwtService _jwtService;

    public AuthService(
        ApplicationDbContext db,
        JwtService jwtService)
    {
        _db = db;
        _jwtService = jwtService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        return await RegisterUserAsync(request);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        return await LoginUserAsync(request);
    }

    public async Task<AuthResponse> RegisterUserAsync(RegisterRequest request)
    {
        var exists = await _db.Users.AnyAsync(u => u.Email == request.Email);
        if (exists)
        {
            throw new Exception("Email already exists");
        }

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            Token = _jwtService.GenerateToken(user),
            Email = user.Email,
            Role = "Customer"
        };
    }

    public async Task<AuthResponse> LoginUserAsync(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            throw new Exception("Invalid email or password");
        }

        var passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!passwordValid)
        {
            throw new Exception("Invalid email or password");
        }

        return new AuthResponse
        {
            Token = _jwtService.GenerateToken(user),
            Email = user.Email,
            Role = "Customer"
        };
    }

    public async Task<AuthResponse> RegisterAdminAsync(AdminRegisterRequest request)
    {
        var exists = await _db.AdminUsers.AnyAsync(u => u.Email == request.Email || u.Username == request.Username);
        if (exists)
        {
            throw new Exception("Admin username or email already exists");
        }

        var admin = new AdminUser
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "Admin"
        };

        _db.AdminUsers.Add(admin);
        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            Token = _jwtService.GenerateAdminToken(admin),
            Email = admin.Email,
            Role = admin.Role
        };
    }

    public async Task<AuthResponse> LoginAdminAsync(LoginRequest request)
    {
        var admin = await _db.AdminUsers.FirstOrDefaultAsync(u => u.Email == request.Email || u.Username == request.Email);
        if (admin == null)
        {
            throw new Exception("Invalid admin email/username or password");
        }

        var passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, admin.PasswordHash);
        if (!passwordValid)
        {
            throw new Exception("Invalid admin email/username or password");
        }

        return new AuthResponse
        {
            Token = _jwtService.GenerateAdminToken(admin),
            Email = admin.Email,
            Role = admin.Role
        };
    }
}