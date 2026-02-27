using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
using SpanishClass.Models.RequestDtos;
using SpanishClass.Npgsql;
using SpanishClass.Services;

namespace SpanishClass.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LevelController : BaseController
{
    private readonly SpanishClassDbContext _context;
    private readonly IEmailService _emailService;

    public LevelController(SpanishClassDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateLevel([FromBody] Level model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (!await IsProfessorAsync(_context))
            return Unauthorized("Only professors are allowed");

        var level = new Level
        {
            Id = Guid.NewGuid(),
            Name = model.Name,
            Description = model.Description,
            Price = model.Price
        };

        _context.Levels.Add(level);
        await _context.SaveChangesAsync();

        return Ok(level);
    }

    [HttpGet]
    public async Task<IActionResult> GetLevels()
    {
        var levels = await _context.Levels
            .Select(l => new
            {
                l.Id,
                l.Name,
                l.Description,
                l.Price
            })
            .ToListAsync();

        return Ok(levels);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLevel(Guid id)
    {
        var level = await _context.Levels
            .Include(l => l.Lessons)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (level == null)
            return NotFound("Level not found");

        var lessonIds = level.Lessons.Select(l => l.Id).ToList();

        var affectedBookings = await _context.Bookings
            .Include(b => b.Student)
                .ThenInclude(s => s.User)
            .Include(b => b.Lesson)
            .Include(b => b.Availability)
            .Where(b => lessonIds.Contains(b.LessonId))
            .ToListAsync();

        foreach (var booking in affectedBookings)
        {
            await _emailService.SendNotificationEmailAsync(
                booking.Student.User.Email,
                "Lesson Cancelled",
                $@"
            <h2>Lesson Cancellation</h2>
            <p>Dear {booking.Student.User.Name},</p>
            <p>The lesson <strong>{booking.Lesson.Name}</strong> 
            scheduled on {booking.Availability.StartTime:dd/MM/yyyy HH:mm}
            has been cancelled because the level was removed.</p>
            <p>Please check the platform for other available lessons.</p>
            "
            );
        }

        _context.Bookings.RemoveRange(affectedBookings);
        _context.Lessons.RemoveRange(level.Lessons);
        _context.Levels.Remove(level);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Level deleted successfully and affected users were notified"
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLevel(Guid id, [FromBody] Level model)
    {
        var level = await _context.Levels.FindAsync(id);

        if (level == null)
            return NotFound("Level not found");

        level.Name = model.Name;
        level.Description = model.Description;
        level.Price = model.Price;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Level updated successfully" });
    }
}