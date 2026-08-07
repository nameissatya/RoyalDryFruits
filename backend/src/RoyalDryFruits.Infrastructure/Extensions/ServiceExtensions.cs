using Microsoft.Extensions.DependencyInjection;
using RoyalDryFruits.Application.Interfaces;
using RoyalDryFruits.Infrastructure.Repositories;
using RoyalDryFruits.Infrastructure.Services;

namespace RoyalDryFruits.Infrastructure.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<JwtService>();

        return services;
    }
}