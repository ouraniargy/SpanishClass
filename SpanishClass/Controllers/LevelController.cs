using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpanishClass.Npgsql;

namespace SpanishClass.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LevelsController : ControllerBase
{
    private readonly SpanishClassDbContext _context;

    public LevelsController(SpanishClassDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetLevels()
    {
        var levels = await _context.Levels
            .Select(l => new
            {
                l.Id,
                l.Name
            })
            .ToListAsync();

        return Ok(levels);
    }
}
