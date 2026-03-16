using Microsoft.AspNetCore.Mvc;
using SpanishClass.Models;
using SpanishClass.Npgsql.IRepositories;

namespace SpanishClass.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LevelController : BaseController
{
    private readonly ILevelRepository _levelRepo;
    private readonly IEmailService _emailService;
    private readonly IAccountRepository _accountRepo;

    public LevelController(ILevelRepository levelRepo, IAccountRepository accountRepo, IBookingRepository _bookingRepo, IEmailService emailService) : base(_bookingRepo)
    {
        _levelRepo = levelRepo;
        _accountRepo = accountRepo;
        _emailService = emailService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateLevel([FromBody] Level model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var isProfessor = await _accountRepo.IsProfessorAsync(LoggedInUserId!.Value);
        if (!isProfessor)
            return Unauthorized("Only professors are allowed");

        var level = new Level
        {
            Id = Guid.NewGuid(),
            Name = model.Name,
            Description = model.Description,
            Price = model.Price
        };

        await _levelRepo.AddLevelAsync(level);
        return Ok(level);
    }

    [HttpGet]
    public async Task<IActionResult> GetLevels()
    {
        var levels = await _levelRepo.GetAllLevelsAsync();
        return Ok(levels.Select(l => new { l.Id, l.Name, l.Description, l.Price }));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLevel(Guid id, [FromBody] Level model)
    {
        var result = await _levelRepo.UpdateLevelAsync(id, model);
        if (!result.Success)
            return StatusCode(result.StatusCode, result.Message);

        return Ok(new { message = result.Message });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLevel(Guid id)
    {
        var result = await _levelRepo.DeleteLevelAsync(id, _emailService);
        if (!result.Success)
            return StatusCode(result.StatusCode, result.Message);

        return Ok(new { message = result.Message });
    }
}