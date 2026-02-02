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
                var userIdString = HttpContext.Session.GetString("UserId");

                if (string.IsNullOrEmpty(userIdString))
                    return null;

                return Guid.Parse(userIdString);
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
