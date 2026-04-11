using SpanishClass.Models;

namespace SpanishClass.Npgsql.IRepositories;

public interface IAccountRepository
{
    Task<ApplicationUser?> GetUserByEmailAsync(string email);
    Task<bool> IsStudentAsync(Guid userId);
    Task<bool> IsProfessorAsync(Guid userId);
    Task<bool> IsAdminAsync(Guid userId);
    Task AddAdminAsync(Guid userId);
    Task AddStudentAsync(Guid userId);
    Task AddProfessorAsync(Guid userId);
    Task SaveChangesAsync();
    Task RemoveStudentAsync(Guid userId);
    Task RemoveProfessorAsync(Guid userId);
    Task RemoveAdminAsync(Guid userId);
}