using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
using SpanishClass.Npgsql;

namespace SpanishClass.Controllers
{
    public abstract class BaseController : Controller
    {
        protected Guid? LoggedInUserId
        {
            get
            {
                var claimId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                return Guid.TryParse(claimId, out var id) ? id : (Guid?)null;
            }
        }

        protected bool IsLoggedIn => LoggedInUserId != null;

        protected async Task<bool> IsProfessorAsync(SpanishClassDbContext context)
        {
            //if (!IsLoggedIn)
            //    return false;

            return await context.Professors
                .AnyAsync(p => p.UserId == LoggedInUserId);
        }

        protected async Task<bool> IsStudentAsync(SpanishClassDbContext context)
        {
            if (!IsLoggedIn)
                return false;

            return await context.Students
                .AnyAsync(s => s.UserId == LoggedInUserId);
        }
    }
}
