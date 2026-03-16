using SpanishClass.Models;

namespace SpanishClass.Npgsql.IRepositories;

public interface IAccountRepository
{
    Task<ApplicationUser?> GetUserByIdAsync(string userId);
    Task<ApplicationUser?> GetUserByEmailAsync(string email);
    Task<bool> IsStudentAsync(Guid userId);
    Task<bool> IsProfessorAsync(Guid userId);
    Task AddStudentAsync(Guid userId);
    Task AddProfessorAsync(Guid userId);
    Task SaveChangesAsync();
}