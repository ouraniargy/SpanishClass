using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
using SpanishClass.Models.RequestDtos;
using SpanishClass.Models.ResponseDtos;
using SpanishClass.Npgsql;
using SpanishClass.Services;

namespace SpanishClass.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LessonController : BaseController
{
    private readonly SpanishClassDbContext _context;
    private readonly IEmailService _emailService;

    public LessonController(SpanishClassDbContext context, IEmailService emailService)
    {
        _emailService = emailService;
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateLesson([FromBody] CreateLessonDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (!await IsProfessorAsync(_context))
            return Unauthorized("Only professors are allowed");

        var userId = LoggedInUserId!.Value;

        var professor = await _context.Professors
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (professor == null)
            return NotFound("Professor not found");

        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            ProfessorId = professor.Id,
            LevelId = model.LevelId,
            DurationMinutes = model.DurationMinutes,
            MaxSeats = model.MaxSeats,
            Name = model.Name,
            Description = model.Description
        };

        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            lesson.Id,
            lesson.ProfessorId,
            lesson.LevelId,
            lesson.DurationMinutes,
            lesson.MaxSeats,
            lesson.Name,
            lesson.Description
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetLessons()
    {
        var userId = LoggedInUserId;

        if (!userId.HasValue)
            return Unauthorized("User not logged in");

        var lessons = await _context.Lessons
            .Include(l => l.Level)                   
            .Include(l => l.Professor)      
                .ThenInclude(p => p.User)          
            .Where(l => l.Professor.UserId == userId.Value) //can only view lessons created by himself
            .Select(l => new
            {
                l.Id,
                l.LevelId,
                l.DurationMinutes,
                l.MaxSeats,
                LevelName = l.Level.Name,
                ProfessorName = l.Professor.User.Name + " " + l.Professor.User.Surname,
                l.ProfessorId,
                l.Name,
                l.Description
            })
            .ToListAsync();

        return Ok(lessons);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLesson(Guid id)
    {
        var userId = LoggedInUserId;

        if (!userId.HasValue)
            return Unauthorized("User not logged in");

        var lesson = await _context.Lessons
            .Include(l => l.Professor)
            .Include(l => l.ProfessorAvailabilities)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lesson == null)
            return NotFound("Lesson not found");

        if (lesson.Professor.UserId != userId.Value)
            return Forbid("You can only delete your own lessons");

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

            if (string.IsNullOrWhiteSpace(email))
                continue;

            await _emailService.SendNotificationEmailAsync(
                email,
                "Lesson Cancelled",
                $@"
            <h2>Lesson Cancellation</h2>
            <p>Dear {booking.Student.User.Name},</p>
            <p>The lesson <strong>{booking.Lesson.Name}</strong> 
            scheduled on {booking.Availability.StartTime:dd/MM/yyyy HH:mm}
            has been cancelled because the lesson was removed.</p>
            <p>Please log in to book another available lesson.</p>
            "
            );
        }

        _context.Bookings.RemoveRange(affectedBookings);
        _context.ProfessorAvailabilities.RemoveRange(lesson.ProfessorAvailabilities);
        _context.Lessons.Remove(lesson);

        await _context.SaveChangesAsync();

        return Ok(new { message = "Lesson deleted and students notified" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLesson(Guid id, [FromBody] UpdateLessonDto model)
    {
        var userId = LoggedInUserId;

        if (!userId.HasValue)
            return Unauthorized("User not logged in");

        var lesson = await _context.Lessons
            .Include(l => l.Professor)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lesson == null)
            return NotFound("Lesson not found");

        if (lesson.Professor.UserId != userId.Value)
            return StatusCode(403, "You can only edit your own lessons");

        lesson.DurationMinutes = model.DurationMinutes;
        lesson.MaxSeats = model.MaxSeats;
        lesson.Name = model.Name;
        lesson.Description = model.Description;

        _context.Lessons.Update(lesson);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Lesson updated successfully" });
    }
}

