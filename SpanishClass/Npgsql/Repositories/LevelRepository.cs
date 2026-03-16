using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
using SpanishClass.Npgsql.IRepositories;

namespace SpanishClass.Npgsql.Repositories;

public class LevelRepository : ILevelRepository
{
    private readonly SpanishClassDbContext _context;

    public LevelRepository(SpanishClassDbContext context)
    {
        _context = context;
    }

    public async Task<Level?> GetLevelByIdAsync(Guid levelId)
    {
        return await _context.Levels
            .Include(l => l.Lessons)
            .FirstOrDefaultAsync(l => l.Id == levelId);
    }

    public async Task<List<Level>> GetAllLevelsAsync()
    {
        return await _context.Levels.ToListAsync();
    }

    public async Task AddLevelAsync(Level level)
    {
        _context.Levels.Add(level);
        await _context.SaveChangesAsync();
    }

    public async Task<(bool Success, int StatusCode, string Message)> UpdateLevelAsync(Guid levelId, Level model)
    {
        var level = await _context.Levels.FindAsync(levelId);
        if (level == null)
            return (false, 404, "Level not found");

        level.Name = model.Name;
        level.Description = model.Description;
        level.Price = model.Price;

        await _context.SaveChangesAsync();
        return (true, 200, "Level updated successfully");
    }

    public async Task<(bool Success, int StatusCode, string Message)> DeleteLevelAsync(Guid levelId, IEmailService emailService)
    {
        var level = await _context.Levels
            .Include(l => l.Lessons)
            .ThenInclude(lesson => lesson.ProfessorAvailabilities)
            .ThenInclude(a => a.Bookings)
            .ThenInclude(b => b.Student)
            .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(l => l.Id == levelId);

        if (level == null)
            return (false, 404, "Level not found");

        var affectedBookings = level.Lessons
            .SelectMany(l => l.ProfessorAvailabilities)
            .SelectMany(a => a.Bookings)
            .ToList();

        foreach (var booking in affectedBookings)
        {
            if (!string.IsNullOrWhiteSpace(booking.Student.User.Email))
            {
                await emailService.SendNotificationEmailAsync(
                    booking.Student.User.Email,
                    "Lesson Cancelled",
                    $@"
                    <h2>Lesson Cancellation</h2>
                    <p>Dear {booking.Student.User.Name},</p>
                    <p>The lesson <strong>{booking.Lesson.Name}</strong> 
                    scheduled on {booking.Availability.StartTime:dd/MM/yyyy HH:mm}
                    has been cancelled because the level was removed.</p>
                    <p>Please check the platform for other available lessons.</p>"
                );
            }
        }

        _context.Bookings.RemoveRange(affectedBookings);
        _context.Lessons.RemoveRange(level.Lessons);
        _context.Levels.Remove(level);

        await _context.SaveChangesAsync();
        return (true, 200, "Level deleted successfully and affected users were notified");
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}