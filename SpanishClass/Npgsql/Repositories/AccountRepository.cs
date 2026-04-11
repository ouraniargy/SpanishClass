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

    public async Task<bool> IsAdminAsync(Guid userId)
    {
        return await _context.Admins.AnyAsync(a => a.UserId == userId);
    }

    public async Task AddAdminAsync(Guid userId)
    {
        _context.Admins.Add(new Admin { Id = Guid.NewGuid(), UserId = userId });
        await _context.SaveChangesAsync();
    }

    public async Task AddStudentAsync(Guid userId)
    {
        _context.Students.Add(new Student { Id = Guid.NewGuid(), UserId = userId });
        await _context.SaveChangesAsync();
    }

    public async Task AddProfessorAsync(Guid userId)
    {
        _context.Professors.Add(new Professor { Id = Guid.NewGuid(), UserId = userId });
        await _context.SaveChangesAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task RemoveStudentAsync(Guid userId)
    {
        var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
        if (student != null)
            _context.Students.Remove(student);
    }

    public async Task RemoveProfessorAsync(Guid userId)
    {
        var professor = await _context.Professors.FirstOrDefaultAsync(p => p.UserId == userId);
        if (professor != null)
            _context.Professors.Remove(professor);
    }

    public async Task RemoveAdminAsync(Guid userId)
    {
        var admin = await _context.Admins.FirstOrDefaultAsync(a => a.UserId == userId);
        if (admin != null)
            _context.Admins.Remove(admin);
    }
}
