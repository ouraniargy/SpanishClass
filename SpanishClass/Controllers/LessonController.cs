using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
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
    public async Task<IActionResult> CreateLesson(Lesson model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (!await IsProfessorAsync(_context))
            return Unauthorized("Only professors are allowed to create a lesson");

        var userId = LoggedInUserId!.Value;

        var professor = await _context.Professors.FirstOrDefaultAsync(a => a.Id == model.ProfessorId);

        if (professor == null)
        {
            return NotFound("Professor not found");
        }

        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            ProfessorId = model.ProfessorId,
            LevelId = model.LevelId,
            DurationMinutes = model.DurationMinutes,
            MaxSeats = model.MaxSeats,
        };

        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync();

        return Ok("Lesson created successfully");
    }
}

