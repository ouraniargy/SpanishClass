using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using SpanishClass.Npgsql.IRepositories;

namespace SpanishClass.Controllers
{
    public abstract class BaseController : Controller
    {
        private readonly IBookingRepository _bookingRepository;

        protected BaseController(IBookingRepository bookingRepository)
        {
            _bookingRepository = bookingRepository;
        }

        protected Guid? LoggedInUserId
        {
            get
            {
                var claimId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                return Guid.TryParse(claimId, out var id) ? id : (Guid?)null;
            }
        }

        protected bool IsLoggedIn => LoggedInUserId != null;

        protected async Task<bool> IsProfessorAsync()
        {
            if (!IsLoggedIn) return false;

            var userId = LoggedInUserId!.Value;
            var professor = await _bookingRepository.GetProfessorByUserIdAsync(userId);
            return professor != null;
        }

        protected async Task<bool> IsStudentAsync()
        {
            if (!IsLoggedIn) return false;

            var userId = LoggedInUserId!.Value;
            var student = await _bookingRepository.GetStudentByUserIdAsync(userId);
            return student != null;
        }
    }
}
