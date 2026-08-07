using RoyalDryFruits.Domain.Entities;

namespace RoyalDryFruits.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);

    Task<User?> GetByEmailAsync(string email);

    Task<bool> ExistsByEmailAsync(string email);

    Task AddAsync(User user);
}