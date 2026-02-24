using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
using SpanishClass.Models.RequestDtos;
using SpanishClass.Npgsql;

namespace SpanishClass.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LevelController : BaseController
{
    private readonly SpanishClassDbContext _context;

    public LevelController(SpanishClassDbContext context)
    {
        _context = context;
    }

    [HttpPost("level")]
    public async Task<IActionResult> CreateLevel([FromBody] Level model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (!await IsProfessorAsync(_context))
            return Unauthorized("Only professors are allowed");

        var level = new Level
        {
            Id = Guid.NewGuid(),
            Name = model.Name,
            Description = model.Description,
            Price = model.Price
        };

        _context.Levels.Add(level);
        await _context.SaveChangesAsync();

        return Ok(level);
    }

    [HttpGet]
    public async Task<IActionResult> GetLevels()
    {
        var levels = await _context.Levels
            .Select(l => new
            {
                l.Id,
                l.Name,
                l.Description,
                l.Price
            })
            .ToListAsync();

        return Ok(levels);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLevel(Guid id)
    {
        var level = await _context.Levels.FindAsync(id);

        if (level == null)
            return NotFound("Level not found");

        var isUsed = await _context.Lessons
            .AnyAsync(l => l.LevelId == id);

        if (isUsed)
            return BadRequest("Cannot delete level. It is used by lessons.");

        _context.Levels.Remove(level);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Level deleted successfully" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLevel(Guid id, [FromBody] Level model)
    {
        var level = await _context.Levels.FindAsync(id);

        if (level == null)
            return NotFound("Level not found");

        level.Name = model.Name;
        level.Description = model.Description;
        level.Price = model.Price;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Level updated successfully" });
    }
}