using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
using SpanishClass.Npgsql;

namespace SpanishClass.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController : BaseController
{
    private readonly SpanishClassDbContext _context;

    public AccountController(SpanishClassDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterViewModel model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existingUser = await _context.ApplicationUsers
            .FirstOrDefaultAsync(u => u.Email == model.Email);

        if (existingUser != null)
            return BadRequest("Email already registered.");

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = model.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password),
            Name = model.Name,
            Surname = model.Surname
        };

        _context.ApplicationUsers.Add(user);

        if (model.Role == "Student")
        {
            _context.Students.Add(new Student
            {
                Id = Guid.NewGuid(),
                UserId = user.Id
            });
        }
        else if (model.Role == "Professor")
        {
            _context.Professors.Add(new Professor
            {
                Id = Guid.NewGuid(),
                UserId = user.Id
            });
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "User registered successfully" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginViewModel model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await _context.ApplicationUsers
            .Include(u => u.Student)
            .Include(u => u.Professor)
            .FirstOrDefaultAsync(u => u.Email == model.Email);

        if (user == null)
            return BadRequest("Invalid email or password.");

        bool passwordValid = BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash);

        if (!passwordValid)
            return BadRequest("Invalid email or password.");

        string role = user.Student != null ? "Student" :
                      user.Professor != null ? "Professor" : "Unknown";

        HttpContext.Session.SetString("UserId", user.Id.ToString());

        return Ok(new
        {
            message = "Login successful",
            userId = user.Id,
            name = user.Name,
            surname = user.Surname,
            role
        });
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = LoggedInUserId;

        if (!userId.HasValue)
            return Unauthorized();

        var result = await _context.ApplicationUsers
            .Where(u => u.Id == userId.Value)
            .Select(u => new
            {
                u.Name,
                u.Surname,
                IsProfessor = _context.Professors.Any(p => p.UserId == u.Id),
                IsStudent = _context.Students.Any(s => s.UserId == u.Id)
            })
            .FirstOrDefaultAsync();

        if (result == null)
            return NotFound();

        string role = result.IsProfessor ? "Professor"
                     : result.IsStudent ? "Student"
                     : "Unknown";

        return Ok(new
        {
            result.Name,
            result.Surname,
            Role = role
        });
    }
}
