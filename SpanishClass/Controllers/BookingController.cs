using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRCoder;
using SpanishClass.Models;
using SpanishClass.Models.RequestDtos;
using SpanishClass.Models.ResponseDtos;
using SpanishClass.Npgsql.IRepositories;

namespace SpanishClass.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingController : BaseController
{
    private readonly IBookingRepository _repo;
    private readonly IEmailService _emailService;

    public BookingController(IBookingRepository repo, IEmailService emailService) : base(repo)
    {
        _repo = repo;
        _emailService = emailService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(BookingFormViewModel model)
    {
        if (!ModelState.IsValid)
            return View(model);

        var userId = LoggedInUserId!.Value;

        var student = await _repo.GetStudentByUserIdAsync(userId);
        if (student == null)
            return Forbid();

        var availability = await _repo.GetAvailabilityAsync(model.AvailabilityId);
        if (availability == null)
            return NotFound();

        var bookedSeats = availability.Bookings?.Count ?? 0;
        var maxSeats = availability.Lesson.MaxSeats;

        if (bookedSeats >= maxSeats)
            return BadRequest("No seats available");
        var seatNumber = (availability.Bookings?.Count ?? 0) + 1;

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            AvailabilityId = model.AvailabilityId,
            StudentId = student.Id,
            CreatedAt = DateTime.UtcNow,
            SeatNumber = seatNumber
        };

        await _repo.AddBookingAsync(booking);
        await _repo.SaveChangesAsync();

        return RedirectToAction("Confirmation", new { id = booking.Id });
    }

    [HttpPost("{availabilityId}")]
    public async Task<IActionResult> BookAvailability(
        Guid availabilityId,
        [FromQuery] Guid studentUserId,
        [FromQuery] bool sendEmail = false)
    {
        var availability = await _repo.GetAvailabilityAsync(availabilityId);
        if (availability == null)
            return NotFound("Availability not found");

        if (availability.BookedSeats >= availability.Lesson.MaxSeats)
            return BadRequest("No seats available");

        var student = await _repo.GetStudentByUserIdAsync(studentUserId);
        if (student == null)
            return BadRequest("Student profile not found");
        var seatNumber = (availability.Bookings?.Count ?? 0) + 1;

        if (await _repo.StudentHasBookingAsync(availabilityId, student.Id))
            return BadRequest("You already booked this lesson");

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            AvailabilityId = availabilityId,
            StudentId = student.Id,
            LessonId = availability.LessonId,
            CreatedAt = DateTime.UtcNow,
            SeatNumber = seatNumber
        };

        await _repo.AddBookingAsync(booking);
        availability.BookedSeats += 1;
        await _repo.SaveChangesAsync();


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
            LessonPhoto = availability.Lesson.LessonPhoto,
            GuestsEmails = new List<string> { student.User.Email },
            ProfessorName = availability.Lesson?.Professor?.User?.Name,
            ProfessorSurname = availability.Lesson?.Professor?.User?.Surname,
            Level = booking.Lesson.Level.Name,
            Price = booking.Lesson.Level.Price
        };

        if (sendEmail)
            await _emailService.SendBookingEmailAsync(bookingDetails);

        return Ok(bookingDetails);
    }

    [HttpPost("addAvailability")]
    public async Task<IActionResult> AddAvailability([FromBody] AddAvailabilityRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var lesson = await _repo.GetLessonWithProfessorAsync(dto.LessonId);
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
        };

        await _repo.AddAvailabilityAsync(avail);
        await _repo.SaveChangesAsync();

        return Ok(new
        {
            id = avail.Id,
            startTime = avail.StartTime,
            endTime = avail.EndTime,
            maxSeats = avail.Lesson.MaxSeats
        });
    }

    [HttpGet("availabilities")]
    public async Task<IActionResult> GetAvailabilities()
    {
        var userId = LoggedInUserId;
        if (!userId.HasValue)
            return Unauthorized("User not logged in");

        var student = await _repo.GetStudentByUserIdAsync(userId.Value);
        var studentId = student?.Id;

        var availabilities = await _repo.GetAllAvailabilitiesAsync(studentId);

        var result = availabilities.Select(a => new
        {
            id = a.Id,
            title = a.Lesson.Level.Name,
            start = a.StartTime,
            end = a.EndTime,
            maxSeats = a.Lesson.MaxSeats,
            bookedSeats = a.Bookings?.Count ?? 0,
            professorName = a.Lesson.Professor.User.Name + " " + a.Lesson.Professor.User.Surname,
            professorUserId = a.Lesson.Professor.UserId,
            description = a.Lesson.Description,
            name = a.Lesson.Name,
            lessonName = a.Lesson.Name,
            lessonPhoto = a.Lesson.LessonPhoto,
            bookedByMe = a.Bookings?.Any(b => b.StudentId == studentId) ?? false,
            bookingId = a.Bookings?.Where(b => b.StudentId == studentId)
                                   .Select(b => b.Id)
                                   .FirstOrDefault(),
            price = a.Lesson.Level.Price
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

        var availability = await _repo.GetAvailabilityAsync(id);

        if (availability == null)
            return NotFound("Availability not found");

        if (availability.Professor.UserId != userId || availability.Professor == null)
            return StatusCode(403, "You can only delete your own availabilities");

        var affectedBookings = await _repo.GetBookingsByAvailabilityIdAsync(id);

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

        await _repo.DeleteAvailabilityAsync(id);
        await _repo.SaveChangesAsync();

        return Ok(new { message = "Availability deleted and students notified" });
    }

    [HttpGet("availabilities/{availabilityId}/students")]
    public async Task<IActionResult> GetStudentsForAvailability(Guid availabilityId)
    {
        var bookings = await _repo.GetBookingsByAvailabilityIdAsync(availabilityId);

        var result = bookings.Select(b => new
        {
            b.Student.UserId,
            StudentName = b.Student.User.Name + " " + b.Student.User.Surname,
            b.Student.User.Email
        }).ToList();

        return Ok(result);
    }

    [HttpDelete("{bookingId}")]
    public async Task<IActionResult> CancelBooking(Guid bookingId)
    {
        var booking = await _repo.GetBookingAsync(bookingId);

        if (booking == null)
            return NotFound("Booking not found");

        booking.Availability.BookedSeats -= 1;

        await _repo.DeleteBookingAsync(bookingId);
        await _repo.SaveChangesAsync();

        var email = booking.Student?.User?.Email;

        if (!string.IsNullOrWhiteSpace(email))
        {
            await _emailService.SendNotificationEmailAsync(
                email,
                "Booking Cancelled",
                $@"
                <h2>Booking Cancelled</h2>
                <p>Your booking for <strong>{booking.Lesson?.Name}</strong> has been cancelled.</p>
                <p>Date: {booking.Availability?.StartTime:dd/MM/yyyy HH:mm}</p>
                "
            );
        }
        return Ok(new { message = "Booking cancelled" });
    }

    [HttpPost("search-booking")]
    public async Task<IActionResult> SearchBooking([FromBody] SearchBookingRequest model)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        Guid? userId = null;

        if (Guid.TryParse(userIdClaim, out var parsed))
        {
            userId = parsed;
        }
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        var bookings = await _repo.SearchBookingsAsync(
            model.Email,
            model.Phone,
            model.Id,
            model.LessonName,
            userId,
            role,
            model.OnlyMine,
            model.SeatNumber
        );

        if (!bookings.Any())
            return NotFound(new { message = "No bookings found." });

        return Ok(bookings.Select(b => new
        {
            message = $"Welcome {b.Student.User.Name}!",
            bookingCode = b.Id,
            lesson = b.Lesson.Name,
            description = b.Lesson.Description,
            lessonPhoto = b.Lesson.LessonPhoto,
            date = b.CreatedAt,
            seatNumber = b.SeatNumber,
            studentName = b.Student.User.Name,
            studentSurname = b.Student.User.Surname,
            level = b.Lesson.Level
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
        if (!Guid.TryParse(model.BookingId.ToString(), out var bookingId))
            return BadRequest("Invalid booking id");

        var booking = await _repo.GetBookingWithStudentAsync(bookingId);

        if (booking == null)
            return NotFound(new { message = "Booking not found" });

        if (booking.Used)
            return BadRequest(new { message = "Ticket already used" });

        await _repo.MarkBookingAsUsedAsync(booking);

        var log = new EntryLog
        {
            Id = Guid.NewGuid(),
            BookingId = booking.Id,
            UserId = booking.Student.UserId,
            EntryTime = DateTime.UtcNow
        };

        await _repo.AddEntryLogAsync(log);

        return Ok(new
        {
            message = "Ticket valid",
            bookingId = booking.Id
        });
    }

    [HttpPost("qrcode/downloaded")]
    public IActionResult QrDownloaded([FromBody] QrDownloadRequest request)
    {
        return Ok(new { success = true });
    }

    [HttpGet("availability/{availabilityId}/entries")]
    public async Task<IActionResult> GetAvailabilityEntries(Guid availabilityId)
    {
        var logs = await _repo.GetEntryLogsByAvailabilityIdAsync(availabilityId);

        var entries = logs.Select(l => new
        {
            bookingId = l.BookingId,
            studentName = l.Booking.Student.User.Name + " " + l.Booking.Student.User.Surname,
            entryTime = l.EntryTime,
            seatNumber = l.Booking.SeatNumber
        }).ToList();

        return Ok(new
        {
            totalCheckedIn = entries.Count,
            entries
        });
    }
}

