using SpanishClass.Models;
using SpanishClass.Models.RequestDtos;

namespace SpanishClass.Npgsql.IRepositories;

public interface ILessonRepository
{
    Task<List<Lesson>> GetLessonsByProfessorUserIdAsync(Guid userId);
    Task AddLessonAsync(Lesson lesson);
    Task<Professor?> GetProfessorByUserIdAsync(Guid userId);
    Task<(bool Success, int StatusCode, string Message)> DeleteLessonAsync(
        Guid lessonId,
        Guid userId,
        IEmailService emailService
    );

    Task<(bool Success, int StatusCode, string Message, string? LessonPhoto)> UpdateLessonAsync(
        Guid lessonId,
        Guid userId,
        UpdateLessonDto model
    );
}