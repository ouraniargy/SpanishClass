using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRCoder;
using SpanishClass.Models;
using SpanishClass.Models.RequestDtos;
using SpanishClass.Npgsql;
using SpanishClass.Services;

namespace SpanishClass.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingController : BaseController
{
    private readonly SpanishClassDbContext _context;
    private readonly IEmailService _emailService;

    public BookingController(SpanishClassDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
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
    public async Task<IActionResult> BookAvailability(
        Guid availabilityId,
        [FromQuery] Guid studentUserId,
        [FromQuery] bool sendEmail = false)
    {
        var availability = await _context.ProfessorAvailabilities
            .Include(a => a.Lesson)
            .FirstOrDefaultAsync(a => a.Id == availabilityId);

        if (availability == null)
            return NotFound("Availability not found");

        if (availability.BookedSeats >= availability.Lesson.MaxSeats)
            return BadRequest("No seats available");

        var student = await _context.Students
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.UserId == studentUserId);

        if (student == null)
            return BadRequest("Student profile not found");

        var alreadyBooked = await _context.Bookings
            .AnyAsync(b => b.AvailabilityId == availabilityId && b.StudentId == student.Id);

        if (alreadyBooked)
            return BadRequest("You already booked this lesson");
        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            AvailabilityId = availabilityId,
            StudentId = student.Id,
            LessonId = availability.LessonId
        };

        _context.Bookings.Add(booking);
        availability.BookedSeats += 1;
        await _context.SaveChangesAsync();

        var bookingDetails = new BookingDetails
        {
            BookingId = booking.Id,
            AvailabilityId = availabilityId,
            StudentName = student.User.Name,
            StudentEmail = student.User.Email,
            LessonName = availability.Lesson.Name,
            Description = availability.Lesson.Description,
            SeatNumber = availability.BookedSeats,
            Date = availability.StartTime,
            RoomPhoto = availability.Lesson.RoomPhoto,
            GuestsEmails = new List<string> { student.User.Email }
        };

        if (sendEmail)
        {
            await _emailService.SendBookingEmailAsync(bookingDetails);
        }

        return Ok(bookingDetails);
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
            return StatusCode(403, "You can only add availability for your own lessons");

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

        var professor = await _context.Professors.FirstOrDefaultAsync(p => p.UserId == userId.Value);

        var studentId = await _context.Students
            .Where(s => s.UserId == userId)
            .Select(s => s.Id)
            .FirstOrDefaultAsync();

        var availabilities = await _context.ProfessorAvailabilities
            .Include(a => a.Lesson)
                .ThenInclude(l => l.Level)
            .Include(a => a.Lesson)
                .ThenInclude(l => l.Professor)
                    .ThenInclude(p => p.User)
            .Include(a => a.Bookings)
                .ThenInclude(b => b.Student)
                    .ThenInclude(s => s.User) 
            .ToListAsync();

        var result = availabilities.Select(a => new
        {
            id = a.Id,
            title = a.Lesson.Level.Name,
            start = a.StartTime,
            end = a.EndTime,
            maxSeats = a.Lesson.MaxSeats,
            bookedSeats = a.Bookings.Count(),
            ProfessorName = a.Lesson.Professor.User.Name + " " + a.Lesson.Professor.User.Surname,
            professorUserId = a.Lesson.Professor.UserId,
            description = a.Lesson.Description,
            name = a.Lesson.Name,
            lessonName = a.Lesson.Name,
            bookedByMe = a.Bookings.Any(b => b.StudentId == studentId),
            bookingId = a.Bookings
                .Where(b => b.StudentId == studentId)
                .Select(b => b.Id)
                .FirstOrDefault()
        });

        return Ok(result);
    }

    [Authorize]
    [HttpDelete("availabilities/{id}")]
    public async Task<IActionResult> DeleteAvailability(Guid id)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            return Unauthorized("User not logged in");

        var availability = await _context.ProfessorAvailabilities
            .Include(a => a.Professor)
            .Include(a => a.Lesson)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (availability == null)
            return NotFound("Availability not found");

        if (availability.Professor.UserId != userId)
            return StatusCode(403, "You can only delete your own availabilities");

        var affectedBookings = await _context.Bookings
            .Include(b => b.Student)
                .ThenInclude(s => s.User)
            .Include(b => b.Lesson)
            .Include(b => b.Availability)
            .Where(b => b.AvailabilityId == id)
            .ToListAsync();

        foreach (var booking in affectedBookings)
        {
            var email = booking.Student?.User?.Email;
            if (string.IsNullOrWhiteSpace(email)) continue;

            await _emailService.SendNotificationEmailAsync(
                email,
                "Lesson Cancelled",
                $@"
            <h2>Lesson Cancellation</h2>
            <p>Dear {booking.Student.User.Name},</p>
            <p>The lesson <strong>{booking.Lesson.Name}</strong> 
            scheduled on {booking.Availability.StartTime:dd/MM/yyyy HH:mm}
            has been cancelled by the professor.</p>
            <p>Please log in to book another available time.</p>"
            );
        }

        _context.Bookings.RemoveRange(affectedBookings);
        _context.ProfessorAvailabilities.Remove(availability);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Availability deleted and students notified" });
    }

    [HttpGet("availabilities/{availabilityId}/students")]
    public async Task<IActionResult> GetStudentsForAvailability(Guid availabilityId)
    {
        var bookings = await _context.Bookings
            .Include(a => a.Student)
            .ThenInclude(a => a.User)
            .Where(b => b.AvailabilityId == availabilityId)
            .Select(b => new
            {
                b.Student.UserId,
                StudentName = b.Student.User.Name + " " + b.Student.User.Surname,
                b.Student.User.Email
            })
            .ToListAsync();

        if (bookings == null)
            return NotFound();

        return Ok(bookings);
    }

    [HttpDelete("{bookingId}")]
    public async Task<IActionResult> CancelBooking(Guid bookingId)
    {
        var booking = await _context.Bookings
            .Include(b => b.Availability)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
            return NotFound("Booking not found");

        booking.Availability.BookedSeats -= 1;

        _context.Bookings.Remove(booking);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Booking cancelled" });
    }

    [HttpPost("search-booking")]
    public async Task<IActionResult> SearchBooking([FromBody] SearchBookingRequest model)
    {
        var bookings = await _context.Bookings
       .Include(b => b.Student)
           .ThenInclude(s => s.User)
               .Include(b => b.Lesson)
               .Where(b =>
                   (!string.IsNullOrEmpty(model.Email) && b.Student.User.Email == model.Email) ||
                   (!string.IsNullOrEmpty(model.Phone) && b.Student.User.PhoneNumber == model.Phone)
               )
               .ToListAsync();

        if (bookings.Count == 0)
        {
            return NotFound(new
            {
                message = "No bookings found."
            });
        }

        return Ok(bookings.Select(b => new
        {
            message = $"Welcome {b.Student.User.Name}!",
            bookingCode = b.Id,
            lesson = b.Lesson.Name,
            description = b.Lesson.Description,
            roomPhoto = b.Lesson.RoomPhoto,
            date = b.CreatedAt
        }));
    }

    [HttpGet("qrcode/{bookingId}")]
    public IActionResult GenerateQrCode(Guid bookingId)
    {
        var qrGenerator = new QRCodeGenerator();
        var qrData = qrGenerator.CreateQrCode(bookingId.ToString(), QRCodeGenerator.ECCLevel.Q);
        var qrCode = new Base64QRCode(qrData);
        var qrBase64 = qrCode.GetGraphic(20);

        return Ok(new { qrImageBase64 = qrBase64 });
    }

    [HttpPost("validate-ticket")]
    public async Task<IActionResult> ValidateTicket([FromBody] ValidateTicketRequest model)
    {
        var booking = await _context.Bookings
            .Include(b => b.Student)
            .FirstOrDefaultAsync(b => b.Id == model.BookingId);

        if (booking == null)
            return NotFound(new { message = "Booking not found" });

        if (booking.Used)
            return BadRequest(new { message = "Ticket already used" });

        booking.Used = true;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Ticket valid, welcome!" });
    }

    [HttpPost("qrcode/downloaded")]
    public IActionResult QrDownloaded([FromBody] QrDownloadRequest request)
    {
        return Ok(new { success = true });
    }
}

