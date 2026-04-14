using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
using SpanishClass.Npgsql.IRepositories;

namespace SpanishClass.Npgsql.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly SpanishClassDbContext _context;

    public BookingRepository(SpanishClassDbContext context)
    {
        _context = context;
    }

    public async Task<ProfessorAvailability?> GetAvailabilityAsync(Guid availabilityId)
    {
        return await _context.ProfessorAvailabilities
            .Include(a => a.Lesson)
                .ThenInclude(l => l.Level)
            .Include(a => a.Professor)
            .Include(a => a.Lesson)
                .ThenInclude(l => l.Professor)
                    .ThenInclude(p => p.User)
            .Include(a => a.Bookings)
            .FirstOrDefaultAsync(a => a.Id == availabilityId);
    }

    public async Task<Booking?> GetBookingAsync(Guid bookingId)
    {
        return await _context.Bookings
            .Include(b => b.Availability)
            .Include(b => b.Student)
                .ThenInclude(s => s.User)
            .Include(b => b.Lesson)
            .FirstOrDefaultAsync(b => b.Id == bookingId);
    }

    public async Task<List<ProfessorAvailability>> GetAllAvailabilitiesAsync(Guid? studentUserId = null)
    {
        return await _context.ProfessorAvailabilities
            .Include(a => a.Lesson)
                .ThenInclude(l => l.Level)
            .Include(a => a.Lesson)
                .ThenInclude(l => l.Professor)
                    .ThenInclude(p => p.User)
             .Include(a => a.Bookings)
                .ThenInclude(b => b.Student)
                    .ThenInclude(s => s.User)
            .ToListAsync();
    }

    public async Task AddBookingAsync(Booking booking)
    {
        _context.Bookings.Add(booking);
        await Task.CompletedTask;
    }

    public async Task AddAvailabilityAsync(ProfessorAvailability availability)
    {
        _context.ProfessorAvailabilities.Add(availability);
        await Task.CompletedTask;
    }

    public async Task DeleteAvailabilityAsync(Guid availabilityId)
    {
        var availability = await _context.ProfessorAvailabilities
            .Include(a => a.Bookings)
            .FirstOrDefaultAsync(a => a.Id == availabilityId);

        if (availability != null)
        {
            _context.Bookings.RemoveRange(availability.Bookings);
            _context.ProfessorAvailabilities.Remove(availability);
        }
    }

    public async Task DeleteBookingAsync(Guid bookingId)
    {
        var booking = await GetBookingAsync(bookingId);
        if (booking != null)
        {
            _context.Bookings.Remove(booking);
        }
    }

    public async Task<bool> StudentHasBookingAsync(Guid availabilityId, Guid studentId)
    {
        return await _context.Bookings.AnyAsync(b => b.AvailabilityId == availabilityId && b.StudentId == studentId);
    }

    public async Task<Professor?> GetProfessorByUserIdAsync(Guid userId)
    {
        return await _context.Professors
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.User.Id == userId);
    }

    public async Task<Student?> GetStudentByUserIdAsync(Guid userId)
    {
        return await _context.Students
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.UserId == userId);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<Lesson?> GetLessonWithProfessorAsync(Guid lessonId)
    {
        return await _context.Lessons
            .Include(l => l.Professor)
                .ThenInclude(p => p.User)
            .FirstOrDefaultAsync(l => l.Id == lessonId);
    }

    public async Task<List<Booking>> GetBookingsByAvailabilityIdAsync(Guid availabilityId)
    {
        return await _context.Bookings
            .Include(b => b.Student)
                .ThenInclude(s => s.User)
            .Include(b => b.Lesson)
            .Include(b => b.Availability)
            .Where(b => b.AvailabilityId == availabilityId)
            .ToListAsync();
    }

    public async Task<List<Booking>> SearchBookingsAsync(
         string? email,
         string? phone,
         string? id,
         string? lessonName,
         Guid? userId,
         string? role,
         bool onlyMine,
         int seatNumber)
    {
        var query = _context.Bookings
            .Include(b => b.Lesson)
            .Include(b => b.Student)
            .ThenInclude(s => s.User)
            .Include(a => a.Lesson)
                .ThenInclude(l => l.Level)
            .Include(a => a.Lesson)
                .ThenInclude(l => l.Professor)
                    .ThenInclude(p => p.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(email))
            query = query.Where(b => b.Student.User.Email.Contains(email));

        if (!string.IsNullOrWhiteSpace(phone))
            query = query.Where(b => b.Student.User.PhoneNumber.Contains(phone));

        if (!string.IsNullOrWhiteSpace(id) && Guid.TryParse(id, out var guid))
            query = query.Where(b => b.Id == guid);

        if (!string.IsNullOrWhiteSpace(lessonName))
            query = query.Where(b => b.Lesson.Name.Contains(lessonName));

        if (onlyMine && userId.HasValue)
        {
            query = query.Where(b => b.Student.UserId == userId);
        }

        return await query.ToListAsync();
    }

    public async Task<Booking?> GetBookingByIdAsync(Guid bookingId)
    {
        return await _context.Bookings
            .Include(b => b.Student)
            .FirstOrDefaultAsync(b => b.Id == bookingId);
    }

    public async Task MarkBookingAsUsedAsync(Booking booking)
    {
        booking.Used = true;
        await _context.SaveChangesAsync();
    }
}