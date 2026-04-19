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
    public async Task<IActionResult> CreateLesson([FromForm] CreateLessonDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (!await IsProfessorAsync())
            return Unauthorized("Only professors are allowed");

        var userId = LoggedInUserId!.Value;
        var professor = await _lessonRepo.GetProfessorByUserIdAsync(userId);

        if (professor == null)
            return NotFound("Professor not found");

        string? photoPath = null;

        if (model.LessonPhoto != null)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid() + Path.GetExtension(model.LessonPhoto.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await model.LessonPhoto.CopyToAsync(stream);

            photoPath = "/uploads/" + fileName;
        }

        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            ProfessorId = professor.Id,
            LevelId = model.LevelId,
            DurationMinutes = model.DurationMinutes,
            MaxSeats = model.MaxSeats,
            Name = model.Name,
            Description = model.Description,
            LessonPhoto = photoPath
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
    public async Task<IActionResult> UpdateLesson(Guid id, [FromForm] UpdateLessonDto model)
    {
        var userId = LoggedInUserId;
        if (!userId.HasValue)
            return Unauthorized("User not logged in");

        var updated = await _lessonRepo.UpdateLessonAsync(id, userId.Value, model);

        if (!updated.Success)
            return StatusCode(updated.StatusCode, updated.Message);

        return Ok(new { message = updated.Message, lessonPhoto = updated.LessonPhoto });
    }


    [HttpGet("{lessonId}/entries")]
    public async Task<IActionResult> GetLessonEntries(Guid lessonId)
    {
        var logs = await _lessonRepo.GetEntryLogsByLessonIdAsync(lessonId);

        var entries = logs.Select(l => new
        {
            studentName = l.Booking.Student.User.Name + " " + l.Booking.Student.User.Surname,
            entryTime = l.EntryTime,
            seatNumber = l.Booking.SeatNumber
        }).ToList();

        return Ok(new
        {
            totalCheckedIn = entries.Count,
            entries = entries
        });
    }
}

