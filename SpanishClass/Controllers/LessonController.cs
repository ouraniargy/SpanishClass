using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
using SpanishClass.Models.RequestDtos;
using SpanishClass.Models.ResponseDtos;
using SpanishClass.Npgsql.IRepositories;
using SpanishClass.Npgsql.Repositories;

namespace SpanishClass.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LessonController : BaseController
{
    private readonly ILessonRepository _lessonRepo;
    private readonly IBookingRepository _bookingRepo;
    private readonly IEmailService _emailService;

    public LessonController(
        IBookingRepository bookingRepo,
        ILessonRepository lessonRepo,
        IEmailService emailService)
        : base(bookingRepo) 
    {
        _bookingRepo = bookingRepo;
        _lessonRepo = lessonRepo;
        _emailService = emailService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateLesson([FromBody] CreateLessonDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (!await IsProfessorAsync())
            return Unauthorized("Only professors are allowed");

        var userId = LoggedInUserId!.Value;
        var professor = await _lessonRepo.GetProfessorByUserIdAsync(userId);

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

        await _lessonRepo.AddLessonAsync(lesson);

        return Ok(lesson);
    }

    [HttpGet]
    public async Task<IActionResult> GetLessons()
    {
        var userId = LoggedInUserId;
        if (!userId.HasValue)
            return Unauthorized("User not logged in");

        var lessons = await _lessonRepo.GetLessonsByProfessorUserIdAsync(userId.Value);

        return Ok(lessons);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLesson(Guid id)
    {
        var userId = LoggedInUserId;
        if (!userId.HasValue)
            return Unauthorized("User not logged in");

        var result = await _lessonRepo.DeleteLessonAsync(id, userId.Value, _emailService);

        if (!result.Success)
            return StatusCode(result.StatusCode, result.Message);

        return Ok(new { message = result.Message });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLesson(Guid id, [FromBody] UpdateLessonDto model)
    {
        var userId = LoggedInUserId;
        if (!userId.HasValue)
            return Unauthorized("User not logged in");

        var updated = await _lessonRepo.UpdateLessonAsync(id, userId.Value, model);
        if (!updated.Success)
            return StatusCode(updated.StatusCode, updated.Message);

        return Ok(new { message = updated.Message });
    }
}

