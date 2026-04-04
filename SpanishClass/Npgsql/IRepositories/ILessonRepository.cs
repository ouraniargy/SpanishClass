using SpanishClass.Models;
using SpanishClass.Models.RequestDtos;

namespace SpanishClass.Npgsql.IRepositories;

public interface ILessonRepository
{
    Task<Lesson?> GetLessonByIdAsync(Guid lessonId);
    Task<List<Lesson>> GetLessonsByProfessorUserIdAsync(Guid userId);
    Task AddLessonAsync(Lesson lesson);
    Task UpdateLessonAsync(Lesson lesson);
    Task DeleteLessonAsync(Lesson lesson);
    Task<List<Booking>> GetBookingsForLessonAsync(Guid lessonId);
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