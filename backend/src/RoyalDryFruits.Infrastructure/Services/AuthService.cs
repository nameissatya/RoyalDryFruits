using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using RoyalDryFruits.Application.Features.Authentication.DTOs;
using RoyalDryFruits.Application.Interfaces;
using RoyalDryFruits.Domain.Entities;
using RoyalDryFruits.Infrastructure.Persistence;
using System.Text.RegularExpressions;

namespace RoyalDryFruits.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _db;
    private readonly JwtService _jwtService;
    private readonly IConfiguration _config;
    private readonly HttpClient _httpClient;

    public AuthService(
        ApplicationDbContext db,
        JwtService jwtService,
        IConfiguration config,
        HttpClient httpClient)
    {
        _db = db;
        _jwtService = jwtService;
        _config = config;
        _httpClient = httpClient;
    }

    private static string NormalizePhoneNumber(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return string.Empty;
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        if (digits.Length >= 10)
        {
            return digits.Substring(digits.Length - 10);
        }
        return digits;
    }

    private static bool IsValidIndianMobile(string phone)
    {
        return !string.IsNullOrEmpty(phone) && Regex.IsMatch(phone, @"^[6-9]\d{9}$");
    }

    private static bool IsValidPin(string pin)
    {
        return !string.IsNullOrEmpty(pin) && Regex.IsMatch(pin, @"^\d{4,6}$");
    }

    // ==========================================
    // MOBILE NUMBER + PIN CUSTOMER AUTHENTICATION
    // ==========================================

    public async Task<AuthResponse> RegisterWithPinAsync(CustomerRegisterWithPinRequest request)
    {
        var cleanPhone = NormalizePhoneNumber(request.Phone);
        if (!IsValidIndianMobile(cleanPhone))
        {
            throw new ArgumentException("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
        }

        var cleanPin = request.Pin?.Trim() ?? string.Empty;
        if (!IsValidPin(cleanPin))
        {
            throw new ArgumentException("PIN must be 4 to 6 numeric digits.");
        }

        var cleanName = request.FullName?.Trim() ?? "Valued Customer";
        if (cleanName.Length < 2)
        {
            throw new ArgumentException("Please enter a valid full name.");
        }

        var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Phone == cleanPhone);
        if (existingUser != null)
        {
            throw new InvalidOperationException($"An account is already registered with mobile number +91 {cleanPhone}. Please sign in with your PIN or contact support if you forgot your PIN.");
        }

        var nameParts = cleanName.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
        var firstName = nameParts.Length > 0 ? nameParts[0] : cleanName;
        var lastName = nameParts.Length > 1 ? nameParts[1] : "";

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = firstName,
            LastName = lastName,
            Phone = cleanPhone,
            Email = null, // No dummy email generated!
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(cleanPin),
            IsPhoneVerified = true,
            FailedLoginAttempts = 0,
            LockoutEndUtc = null,
            LastLoginAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            Token = _jwtService.GenerateToken(user),
            Phone = user.Phone,
            Email = user.Email,
            Name = $"{user.FirstName} {user.LastName}".Trim(),
            Role = "Customer"
        };
    }

    public async Task<AuthResponse> LoginWithPinAsync(CustomerPinLoginRequest request)
    {
        var cleanPhone = NormalizePhoneNumber(request.Phone);
        if (!IsValidIndianMobile(cleanPhone))
        {
            throw new ArgumentException("Please enter a valid 10-digit Indian mobile number.");
        }

        var cleanPin = request.Pin?.Trim() ?? string.Empty;
        if (!IsValidPin(cleanPin))
        {
            throw new ArgumentException("Please enter a valid 4 to 6 digit PIN.");
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Phone == cleanPhone);
        if (user == null)
        {
            throw new KeyNotFoundException($"No account found for mobile number +91 {cleanPhone}. Please create a new account.");
        }

        if (!user.IsActive)
        {
            throw new InvalidOperationException("This account has been deactivated. Please contact customer support.");
        }

        // Check if account is temporarily locked
        if (user.LockoutEndUtc.HasValue && user.LockoutEndUtc.Value > DateTime.UtcNow)
        {
            var remainingMins = (int)Math.Ceiling((user.LockoutEndUtc.Value - DateTime.UtcNow).TotalMinutes);
            throw new InvalidOperationException($"Account is temporarily locked due to repeated failed login attempts. Please try again in {remainingMins} minute(s) or contact support to reset your PIN.");
        }

        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            throw new InvalidOperationException("A security PIN has not been set for this account yet. Please contact support to set up your PIN.");
        }

        var pinValid = BCrypt.Net.BCrypt.Verify(cleanPin, user.PasswordHash);
        if (!pinValid)
        {
            user.FailedLoginAttempts += 1;
            if (user.FailedLoginAttempts >= 5)
            {
                user.LockoutEndUtc = DateTime.UtcNow.AddMinutes(15);
                await _db.SaveChangesAsync();
                throw new InvalidOperationException("Account temporarily locked for 15 minutes due to 5 failed PIN attempts. Please try again later or contact store support.");
            }
            else
            {
                await _db.SaveChangesAsync();
                var remaining = 5 - user.FailedLoginAttempts;
                throw new ArgumentException($"Incorrect PIN. {remaining} attempt(s) remaining before temporary lockout.");
            }
        }

        // Successful PIN authentication
        user.FailedLoginAttempts = 0;
        user.LockoutEndUtc = null;
        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            Token = _jwtService.GenerateToken(user),
            Phone = user.Phone,
            Email = user.Email,
            Name = $"{user.FirstName} {user.LastName}".Trim(),
            Role = "Customer",
            MustChangePin = user.MustChangePin
        };
    }

    public async Task<AuthResponse> ChangePinAsync(ChangePinRequest request)
    {
        var cleanPhone = NormalizePhoneNumber(request.Phone);
        if (!IsValidIndianMobile(cleanPhone))
        {
            throw new ArgumentException("Please enter a valid 10-digit Indian mobile number.");
        }

        var cleanOldPin = request.OldPin?.Trim() ?? string.Empty;
        var cleanNewPin = request.NewPin?.Trim() ?? string.Empty;

        if (!IsValidPin(cleanOldPin))
        {
            throw new ArgumentException("Please enter your valid temporary/current PIN.");
        }

        if (!IsValidPin(cleanNewPin))
        {
            throw new ArgumentException("New PIN must be 4 to 6 numeric digits.");
        }

        if (cleanOldPin == cleanNewPin)
        {
            throw new ArgumentException("Your new PIN must be different from your temporary PIN.");
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Phone == cleanPhone);
        if (user == null)
        {
            throw new KeyNotFoundException($"No account found for mobile number +91 {cleanPhone}.");
        }

        if (!user.IsActive)
        {
            throw new InvalidOperationException("This account has been deactivated.");
        }

        if (user.LockoutEndUtc.HasValue && user.LockoutEndUtc.Value > DateTime.UtcNow)
        {
            var remainingMins = (int)Math.Ceiling((user.LockoutEndUtc.Value - DateTime.UtcNow).TotalMinutes);
            throw new InvalidOperationException($"Account is temporarily locked. Please try again in {remainingMins} minute(s).");
        }

        var oldPinValid = !string.IsNullOrEmpty(user.PasswordHash) && BCrypt.Net.BCrypt.Verify(cleanOldPin, user.PasswordHash);
        if (!oldPinValid)
        {
            user.FailedLoginAttempts += 1;
            if (user.FailedLoginAttempts >= 5)
            {
                user.LockoutEndUtc = DateTime.UtcNow.AddMinutes(15);
                await _db.SaveChangesAsync();
                throw new InvalidOperationException("Account temporarily locked for 15 minutes due to 5 failed PIN attempts.");
            }
            await _db.SaveChangesAsync();
            var remaining = 5 - user.FailedLoginAttempts;
            throw new ArgumentException($"Incorrect temporary PIN. {remaining} attempt(s) remaining.");
        }

        // Successfully verified temporary PIN -> set new permanent PIN
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(cleanNewPin);
        user.MustChangePin = false;
        user.FailedLoginAttempts = 0;
        user.LockoutEndUtc = null;
        user.LastLoginAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            Token = _jwtService.GenerateToken(user),
            Phone = user.Phone,
            Email = user.Email,
            Name = $"{user.FirstName} {user.LastName}".Trim(),
            Role = "Customer",
            MustChangePin = false
        };
    }

    public async Task<ForgotPinInfoResponse> GetForgotPinInfoAsync(string phone)
    {
        var cleanPhone = NormalizePhoneNumber(phone);
        var isRegistered = false;
        if (!string.IsNullOrEmpty(cleanPhone))
        {
            isRegistered = await _db.Users.AnyAsync(u => u.Phone == cleanPhone);
        }

        var settings = await _db.StoreSettings.FirstOrDefaultAsync();
        var supportPhone = !string.IsNullOrWhiteSpace(settings?.Phone) ? settings.Phone : "+91 90140 60329";
        var supportWa = new string(supportPhone.Where(char.IsDigit).ToArray());
        if (supportWa.Length == 10) supportWa = "91" + supportWa;

        return new ForgotPinInfoResponse
        {
            Phone = cleanPhone,
            SupportPhone = supportPhone,
            SupportWhatsApp = supportWa,
            IsRegistered = isRegistered,
            Message = "For security, PIN reset is handled by our store support team. Please contact us via WhatsApp or Phone call to reset your PIN immediately."
        };
    }

    // ==========================================
    // ADMIN CUSTOMER & PIN MANAGEMENT
    // ==========================================

    public async Task<List<CustomerUserDto>> GetCustomersForAdminAsync(string? query = null)
    {
        var usersQuery = _db.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query))
        {
            var q = query.Trim().ToLower();
            usersQuery = usersQuery.Where(u =>
                (u.FirstName + " " + u.LastName).ToLower().Contains(q) ||
                (u.Phone != null && u.Phone.Contains(q)) ||
                (u.Email != null && u.Email.ToLower().Contains(q)));
        }

        var users = await usersQuery
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        var orders = await _db.Orders
            .AsNoTracking()
            .Select(o => new { o.CustomerPhone, o.TotalAmount })
            .ToListAsync();

        var orderStatsByPhone = orders
            .Where(o => !string.IsNullOrEmpty(o.CustomerPhone))
            .GroupBy(o => NormalizePhoneNumber(o.CustomerPhone))
            .ToDictionary(
                g => g.Key,
                g => new { Count = g.Count(), Total = g.Sum(x => x.TotalAmount) }
            );

        return users.Select(u =>
        {
            var cleanPhone = NormalizePhoneNumber(u.Phone);
            var hasOrders = orderStatsByPhone.TryGetValue(cleanPhone, out var stats);
            var isLocked = u.LockoutEndUtc.HasValue && u.LockoutEndUtc.Value > DateTime.UtcNow;

            return new CustomerUserDto
            {
                Id = u.Id,
                Name = $"{u.FirstName} {u.LastName}".Trim(),
                Phone = u.Phone ?? "N/A",
                Email = u.Email,
                FailedLoginAttempts = u.FailedLoginAttempts,
                IsLocked = isLocked,
                LockoutEndUtc = u.LockoutEndUtc,
                LastLoginAt = u.LastLoginAt,
                CreatedAt = u.CreatedAt,
                OrdersCount = hasOrders ? stats!.Count : 0,
                TotalSpent = hasOrders ? stats!.Total : 0
            };
        }).ToList();
    }

    public async Task<bool> AdminResetCustomerPinAsync(Guid userId, string newPin)
    {
        var cleanPin = newPin?.Trim() ?? string.Empty;
        if (!IsValidPin(cleanPin))
        {
            throw new ArgumentException("New PIN must be 4 to 6 numeric digits.");
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            throw new KeyNotFoundException("Customer account not found.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(cleanPin);
        user.MustChangePin = true;
        user.FailedLoginAttempts = 0;
        user.LockoutEndUtc = null;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AdminUnlockCustomerAsync(Guid userId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            throw new KeyNotFoundException("Customer account not found.");
        }

        user.FailedLoginAttempts = 0;
        user.LockoutEndUtc = null;

        await _db.SaveChangesAsync();
        return true;
    }

    // ==========================================
    // LEGACY & ADMIN AUTHENTICATION
    // ==========================================

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
            throw new InvalidOperationException("Email already exists");
        }

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsActive = true
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            Token = _jwtService.GenerateToken(user),
            Email = user.Email,
            Name = $"{user.FirstName} {user.LastName}".Trim(),
            Role = "Customer"
        };
    }

    public async Task<AuthResponse> LoginUserAsync(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            throw new KeyNotFoundException("Invalid email or password");
        }

        if (string.IsNullOrEmpty(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new ArgumentException("Invalid email or password");
        }

        return new AuthResponse
        {
            Token = _jwtService.GenerateToken(user),
            Email = user.Email,
            Name = $"{user.FirstName} {user.LastName}".Trim(),
            Role = "Customer"
        };
    }

    public async Task<AuthResponse> RegisterAdminAsync(AdminRegisterRequest request)
    {
        var exists = await _db.AdminUsers.AnyAsync(u => u.Email == request.Email || u.Username == request.Username);
        if (exists)
        {
            throw new InvalidOperationException("Admin username or email already exists");
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
            Name = admin.Username,
            Role = admin.Role
        };
    }

    public async Task<AuthResponse> LoginAdminAsync(LoginRequest request)
    {
        var admin = await _db.AdminUsers.FirstOrDefaultAsync(u => u.Email == request.Email || u.Username == request.Email);
        if (admin == null)
        {
            throw new KeyNotFoundException("Invalid admin email/username or password");
        }

        var passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, admin.PasswordHash);
        if (!passwordValid)
        {
            throw new ArgumentException("Invalid admin email/username or password");
        }

        return new AuthResponse
        {
            Token = _jwtService.GenerateAdminToken(admin),
            Email = admin.Email,
            Name = admin.Username,
            Role = admin.Role
        };
    }

    public async Task<AuthResponse> SendOtpAsync(SendOtpRequest request)
    {
        return new AuthResponse { Phone = request.Phone, Token = "OTP_DEPRECATED", Role = "Customer" };
    }

    public async Task<AuthResponse> VerifyOtpAsync(VerifyOtpRequest request)
    {
        var cleanPhone = NormalizePhoneNumber(request.Phone);
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Phone == cleanPhone);
        if (user == null)
        {
            user = new User
            {
                FirstName = request.FullName ?? "Valued",
                LastName = "Customer",
                Email = null,
                Phone = cleanPhone,
                IsPhoneVerified = true
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }

        return new AuthResponse
        {
            Token = _jwtService.GenerateToken(user),
            Phone = user.Phone,
            Email = user.Email,
            Name = $"{user.FirstName} {user.LastName}".Trim(),
            Role = "Customer"
        };
    }
}