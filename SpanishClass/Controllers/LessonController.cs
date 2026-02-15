using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
using SpanishClass.Models.RequestDtos;
using SpanishClass.Models.ResponseDtos;
using SpanishClass.Npgsql;

namespace SpanishClass.Controllers;

[ApiController]
[Route("api/lesson/[controller]")]
public class LessonController : BaseController
{
    private readonly SpanishClassDbContext _context;

    public LessonController(SpanishClassDbContext context)
    {
        _context = context;
    }

    [HttpPost("lesson")]
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
            LessonName = model.LessonName
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
            lesson.LessonName
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
                l.LessonName
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
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lesson == null)
            return NotFound("Lesson not found");

        if (lesson.Professor.UserId != userId.Value)
            return Forbid("You can only delete your own lessons");

        _context.Lessons.Remove(lesson);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Lesson deleted successfully" });
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
            return Forbid("You can only edit your own lessons");

        lesson.DurationMinutes = model.DurationMinutes;
        lesson.MaxSeats = model.MaxSeats;
        lesson.LessonName = model.LessonName;

        _context.Lessons.Update(lesson);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Lesson updated successfully" });
    }
}

