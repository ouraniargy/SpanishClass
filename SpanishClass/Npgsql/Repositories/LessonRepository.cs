using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
using SpanishClass.Models.RequestDtos;
using SpanishClass.Npgsql.IRepositories;

namespace SpanishClass.Npgsql.Repositories;

public class LessonRepository : ILessonRepository
{
    private readonly SpanishClassDbContext _context;

    public LessonRepository(SpanishClassDbContext context)
    {
        _context = context;
    }

    public async Task<List<Lesson>> GetLessonsByProfessorUserIdAsync(Guid userId)
    {
        return await _context.Lessons
            .Include(l => l.Level)
            .Include(l => l.Professor)
                .ThenInclude(p => p.User)
            .Where(l => l.Professor.UserId == userId)
            .ToListAsync();
    }

    public async Task AddLessonAsync(Lesson lesson)
    {
        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync();
    }

    public async Task<Professor?> GetProfessorByUserIdAsync(Guid userId)
    {
        return await _context.Professors
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.User.Id == userId);
    }

    public async Task<(bool Success, int StatusCode, string Message)> DeleteLessonAsync(
       Guid lessonId, Guid userId, IEmailService emailService)
    {
        var lesson = await _context.Lessons
            .Include(l => l.Professor)
            .Include(l => l.ProfessorAvailabilities)
            .FirstOrDefaultAsync(l => l.Id == lessonId);

        if (lesson == null)
            return (false, 404, "Lesson not found");

        if (lesson.Professor.UserId != userId)
            return (false, 403, "You can only delete your own lessons");

        var availabilityIds = lesson.ProfessorAvailabilities.Select(a => a.Id).ToList();

        var affectedBookings = await _context.Bookings
            .Include(b => b.Student)
                .ThenInclude(s => s.User)
            .Include(b => b.Lesson)
            .Include(b => b.Availability)
            .Where(b => availabilityIds.Contains(b.AvailabilityId))
            .ToListAsync();

        foreach (var booking in affectedBookings)
        {
            var email = booking.Student?.User?.Email;
            if (!string.IsNullOrWhiteSpace(email))
            {
                await emailService.SendNotificationEmailAsync(
                    email,
                    "Lesson Cancelled",
                    $@"
                    <h2>Lesson Cancellation</h2>
                    <p>Dear {booking.Student.User.Name},</p>
                    <p>The lesson <strong>{booking.Lesson.Name}</strong> 
                    scheduled on {booking.Availability.StartTime:dd/MM/yyyy HH:mm}
                    has been cancelled because the lesson was removed.</p>
                    <p>Please log in to book another available lesson.</p>"
                );
            }
        }

        _context.Bookings.RemoveRange(affectedBookings);
        _context.ProfessorAvailabilities.RemoveRange(lesson.ProfessorAvailabilities);
        _context.Lessons.Remove(lesson);

        await _context.SaveChangesAsync();
        return (true, 200, "Lesson deleted and students notified");
    }

    public async Task<(bool Success, int StatusCode, string Message, string? LessonPhoto)> UpdateLessonAsync(
    Guid lessonId, Guid userId, UpdateLessonDto model)
    {
        var lesson = await _context.Lessons
            .Include(l => l.Professor)
            .FirstOrDefaultAsync(l => l.Id == lessonId);

        if (lesson == null)
            return (false, 404, "Lesson not found", null);

        if (lesson.Professor.UserId != userId)
            return (false, 403, "You can only edit your own lessons", null);

        if (model.LessonPhoto != null)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid() + Path.GetExtension(model.LessonPhoto.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await model.LessonPhoto.CopyToAsync(stream);

            lesson.LessonPhoto = "/uploads/" + fileName;
        }

        lesson.Name = model.Name;
        lesson.Description = model.Description;
        lesson.DurationMinutes = model.DurationMinutes;
        lesson.MaxSeats = model.MaxSeats;

        _context.Lessons.Update(lesson);
        await _context.SaveChangesAsync();

        return (true, 200, "Lesson updated successfully", lesson.LessonPhoto);
    }


    public async Task<List<EntryLog>> GetEntryLogsByLessonIdAsync(Guid lessonId)
    {
        return await _context.EntryLogs
            .Include(e => e.Booking)
                .ThenInclude(b => b.Lesson)
            .Include(e => e.Booking)
                .ThenInclude(b => b.Student)
                    .ThenInclude(s => s.User)
            .Where(e => e.Booking.LessonId == lessonId)
            .OrderByDescending(e => e.EntryTime)
            .ToListAsync();
    }
}