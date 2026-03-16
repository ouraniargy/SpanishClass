using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
using SpanishClass.Npgsql.IRepositories;

namespace SpanishClass.Npgsql.Repositories;

public class AccountRepository : IAccountRepository
{
    private readonly SpanishClassDbContext _context;

    public AccountRepository(SpanishClassDbContext context)
    {
        _context = context;
    }

    public async Task<ApplicationUser?> GetUserByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<bool> IsStudentAsync(Guid userId)
    {
        return await _context.Students.AnyAsync(s => s.UserId == userId);
    }

    public async Task<bool> IsProfessorAsync(Guid userId)
    {
        return await _context.Professors.AnyAsync(p => p.UserId == userId);
    }

    public async Task AddStudentAsync(Guid userId)
    {
        _context.Students.Add(new Student { Id = Guid.NewGuid(), UserId = userId });
        await Task.CompletedTask;
    }

    public async Task AddProfessorAsync(Guid userId)
    {
        _context.Professors.Add(new Professor { Id = Guid.NewGuid(), UserId = userId });
        await Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
