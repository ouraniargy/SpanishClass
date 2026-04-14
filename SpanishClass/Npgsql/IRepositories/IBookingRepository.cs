using SpanishClass.Models;

namespace SpanishClass.Npgsql.IRepositories;

public interface IBookingRepository
{
    Task<ProfessorAvailability?> GetAvailabilityAsync(Guid availabilityId);
    Task<Booking?> GetBookingAsync(Guid bookingId);
    Task<List<ProfessorAvailability>> GetAllAvailabilitiesAsync(Guid? studentUserId = null);
    Task AddBookingAsync(Booking booking);
    Task AddAvailabilityAsync(ProfessorAvailability availability);
    Task DeleteAvailabilityAsync(Guid availabilityId);
    Task DeleteBookingAsync(Guid bookingId);
    Task<bool> StudentHasBookingAsync(Guid availabilityId, Guid studentId);
    Task<Professor?> GetProfessorByUserIdAsync(Guid userId);
    Task<Student?> GetStudentByUserIdAsync(Guid userId);
    Task SaveChangesAsync();
    Task<Lesson?> GetLessonWithProfessorAsync(Guid lessonId);
    Task<List<Booking>> GetBookingsByAvailabilityIdAsync(Guid availabilityId);
    Task<List<Booking>> SearchBookingsAsync(
        string? email,
        string? phone,
        string? id,
        string? lessonName,
        Guid? userId,
        string? role,
        bool onlyMine,
        int seatNumber
    );
    Task<Booking?> GetBookingByIdAsync(Guid bookingId);
    Task MarkBookingAsUsedAsync(Booking booking);
}