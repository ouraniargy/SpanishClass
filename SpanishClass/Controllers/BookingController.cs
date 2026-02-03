using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
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

    [HttpPost("booking")]
    public async Task<IActionResult> CreateBooking(Booking model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (!await IsProfessorAsync(_context))
            return Unauthorized("Only professors allowed");

        var userId = LoggedInUserId!.Value;

        var availability = await _context.ProfessorAvailabilities.FirstOrDefaultAsync(a => a.Id == model.AvailabilityId);

        if (availability == null)
        {
            return NotFound("Availability not found");
        }

        var bookedSeats = await _context.Bookings.CountAsync(a => a.AvailabilityId == availability.Id);

        if (bookedSeats >= availability.MaxSeats)
        {
            return BadRequest("No avaiable seats");
        }

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            AvailabilityId = availability.Id,
            CreatedAt = DateTime.UtcNow,
            LessonId = availability.LessonId
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return Ok("Booking created successfully");
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
            LessonDate = availability.StartTime
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create(BookingFormViewModel model)
    {
        if (!ModelState.IsValid)
            return View(model);

        if (!await IsStudentAsync(_context))
            return Forbid();

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

        if (model.SendEmail)
        {
            // EmailService.SendBookingEmail
        }

        return RedirectToAction("Confirmation", new { id = booking.Id });
    }

}

