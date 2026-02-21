using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
using SpanishClass.Models.RequestDtos;
using SpanishClass.Npgsql;

namespace SpanishClass.Controllers;

[ApiController]
[Route("api/booking/[controller]")]
public class BookingController : BaseController
{
    private readonly SpanishClassDbContext _context;

    public BookingController(SpanishClassDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Create(Guid availabilityId)
    {
        var availability = await _context.ProfessorAvailabilities
            .Include(a => a.Lesson)
                .ThenInclude(l => l.Level)
            .FirstOrDefaultAsync(a => a.Id == availabilityId);

        if (availability == null)
            return NotFound();

        return View(new BookingFormViewModel
        {
            AvailabilityId = availabilityId,
            LessonDate = availability.StartTime,
            MaxSeats = availability.Lesson.MaxSeats
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create(BookingFormViewModel model)
    {
        if (!ModelState.IsValid)
            return View(model);

        if (!await IsStudentAsync(_context))
            return Forbid();

        var availability = await _context.ProfessorAvailabilities
            .Include(a => a.Bookings)
            .Include(a => a.Lesson)
            .FirstOrDefaultAsync(a => a.Id == model.AvailabilityId);

        if (availability == null)
            return NotFound();

        var bookedSeats = availability.Bookings.Count();
        var maxSeats = availability.Lesson.MaxSeats;

        if (bookedSeats >= maxSeats)
            return BadRequest("No seats available");

        var userId = LoggedInUserId!.Value;

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            AvailabilityId = model.AvailabilityId,
            StudentId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return RedirectToAction("Confirmation", new { id = booking.Id });
    }

    [HttpPost("{availabilityId}")]
    public async Task<IActionResult> BookAvailability(Guid availabilityId, [FromQuery] Guid studentUserId)
    {
        var availability = await _context.ProfessorAvailabilities
            .Include(a => a.Lesson)
            .FirstOrDefaultAsync(a => a.Id == availabilityId);

        if (availability == null)
            return NotFound("Availability not found");

        var maxSeats = availability.Lesson.MaxSeats;

        if (availability.BookedSeats >= maxSeats)
            return BadRequest("No seats available");

        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.UserId == studentUserId);

        if (student == null)
            return BadRequest("Student profile not found");

        var alreadyBooked = await _context.Bookings
            .AnyAsync(b => b.AvailabilityId == availabilityId && b.StudentId == student.Id);

        if (alreadyBooked)
            return BadRequest("You already booked this lesson");

        availability.BookedSeats += 1;

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            AvailabilityId = availabilityId,
            StudentId = student.Id,
            LessonId = availability.LessonId
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Booking successful" });
    }

    [HttpPost("addAvailability")]
    public async Task<IActionResult> AddAvailability([FromBody] AddAvailabilityRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var lesson = await _context.Lessons
            .Include(l => l.Professor)
            .FirstOrDefaultAsync(l => l.Id == dto.LessonId);
        if (lesson == null)
            return NotFound("Lesson not found");

        var professor = lesson.Professor;
        if (professor == null)
            return BadRequest("Professor for lesson not found");

        if (LoggedInUserId == null || professor.UserId != LoggedInUserId.Value)
            return Forbid("You can only add availability for your own lessons");

        var avail = new ProfessorAvailability
        {
            Id = Guid.NewGuid(),
            ProfessorId = professor.Id,
            LessonId = lesson.Id,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            MaxSeats = dto.MaxSeats
        };

        _context.ProfessorAvailabilities.Add(avail);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = avail.Id,
            startTime = avail.StartTime,
            endTime = avail.EndTime,
            maxSeats = avail.MaxSeats
        });
    }

    [HttpGet("availabilities")]
    public async Task<IActionResult> GetAvailabilities()
    {
        var userId = LoggedInUserId;
        if (!userId.HasValue)
            return Unauthorized("User not logged in");

        var availabilities = await _context.ProfessorAvailabilities
            .Include(a => a.Lesson)
                .ThenInclude(l => l.Level)
            .Include(a => a.Lesson)
                .ThenInclude(l => l.Professor)
                    .ThenInclude(p => p.User)
            .Include(a => a.Bookings)
            .ToListAsync();

        var result = availabilities.Select(a => new
        {
            id = a.Id,
            title = a.Lesson.Level.Name,
            start = a.StartTime,
            end = a.EndTime,
            maxSeats = a.Lesson.MaxSeats,
            bookedSeats = a.Bookings.Count(),
            ProfessorName = a.Lesson.Professor.User.Name + " " +
                a.Lesson.Professor.User.Surname,
            professorUserId = a.Lesson.Professor.UserId,
            lessonName = a.Lesson.LessonName
        });

        return Ok(result);
    }

    [HttpDelete("availabilities/{id}")]
    public async Task<IActionResult> DeleteAvailability(Guid id)
    {
        var userId = LoggedInUserId;
        if (!userId.HasValue)
            return Unauthorized("User not logged in");

        var availability = await _context.ProfessorAvailabilities
            .Include(a => a.Professor)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (availability == null)
            return NotFound("Availability not found");

        if (availability.Professor.UserId != userId.Value)
            return Forbid("You can only delete your own availabilities");

        _context.ProfessorAvailabilities.Remove(availability);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Availability deleted successfully" });
    }
}

