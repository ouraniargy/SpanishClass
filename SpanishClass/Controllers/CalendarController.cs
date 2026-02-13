using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
using SpanishClass.Npgsql;

namespace SpanishClass.Controllers
{
    public class CalendarController : BaseController
    {
        private readonly SpanishClassDbContext _context;

        public CalendarController(SpanishClassDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> CalendarRepository(int month, int year)
        {
            var data = await _context.ProfessorAvailabilities
                .Include(a => a.Lesson)
                    .ThenInclude(l => l.Level)
                .Include(a => a.Lesson.Professor.User)
                .Include(a => a.Bookings)
                    .ThenInclude(b => b.Student.User)
                .Where(a => a.StartTime.Month == month && a.StartTime.Year == year)
                .Select(a => new CalendarViewModel
                {
                    AvailabilityId = a.Id,
                    Date = a.StartTime,
                    LessonDescription = $"{a.Lesson.Level.Name} - {a.Lesson.DurationMinutes} min",
                    ProfessorName = a.Lesson.Professor.User.Name + " " +
                                    a.Lesson.Professor.User.Surname,
                    MaxSeats = a.MaxSeats,
                    BookedSeats = a.Bookings.Count,
                    StudentNames = a.Bookings
                        .Select(b => b.Student.User.Name + " " + b.Student.User.Surname)
                        .ToList()
                })
                .ToListAsync();

            return View(data);
        }

        [HttpGet("api/calendar")]
        public async Task<IActionResult> GetCalendar(int month, int year)
        {
            var data = await _context.ProfessorAvailabilities
                .Include(a => a.Lesson)
                    .ThenInclude(l => l.Level)
                .Include(a => a.Lesson.Professor.User)
                .Include(a => a.Bookings)
                    .ThenInclude(b => b.Student.User)
                .Where(a => a.StartTime.Month == month && a.StartTime.Year == year)
                .Select(a => new CalendarViewModel
                {
                    AvailabilityId = a.Id,
                    Date = a.StartTime,
                    LessonDescription = $"{a.Lesson.Level.Name} - {a.Lesson.DurationMinutes} min",
                    ProfessorName = a.Lesson.Professor.User.Name + " " +
                                    a.Lesson.Professor.User.Surname,
                    MaxSeats = a.MaxSeats,
                    BookedSeats = a.Bookings.Count,
                    StudentNames = a.Bookings
                        .Select(b => b.Student.User.Name + " " + b.Student.User.Surname)
                        .ToList()
                })
                .ToListAsync();

            return Ok(data);
        }

    }

}
