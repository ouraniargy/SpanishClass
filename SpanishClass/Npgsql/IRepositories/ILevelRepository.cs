using SpanishClass.Models;

namespace SpanishClass.Npgsql.IRepositories;

public interface ILevelRepository
{
    Task<List<Level>> GetAllLevelsAsync();
    Task AddLevelAsync(Level level);
    Task<(bool Success, int StatusCode, string Message)> UpdateLevelAsync(Guid levelId, Level model);
    Task<(bool Success, int StatusCode, string Message)> DeleteLevelAsync(Guid levelId, IEmailService emailService);
    Task SaveChangesAsync();
}