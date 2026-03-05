using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
using SpanishClass.Npgsql;

namespace SpanishClass.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : BaseController
    {
        private readonly SpanishClassDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public AccountController(
            SpanishClassDbContext context,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager)
        {
            _context = context;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
                return BadRequest("Email already registered.");

            var user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = model.Email,
                Email = model.Email,
                Name = model.Name,
                Surname = model.Surname
            };

            var createResult = await _userManager.CreateAsync(user, model.Password);
            if (!createResult.Succeeded)
                return BadRequest(createResult.Errors);

            if (model.Role == "Student")
            {
                _context.Students.Add(new Student { Id = Guid.NewGuid(), UserId = user.Id });
            }
            else if (model.Role == "Professor")
            {
                _context.Professors.Add(new Professor { Id = Guid.NewGuid(), UserId = user.Id });
            }

            await _context.SaveChangesAsync();

            await _signInManager.SignInAsync(user, isPersistent: false);

            return Ok(new
            {
                message = "Registration successful",
                userId = user.Id,
                name = user.Name,
                surname = user.Surname,
                role = model.Role
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return BadRequest("Invalid email or password.");

            var signInResult = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!signInResult.Succeeded)
                return BadRequest("Invalid email or password.");

            string role = await _context.Students.AnyAsync(s => s.UserId == user.Id) ? "Student" :
                          await _context.Professors.AnyAsync(p => p.UserId == user.Id) ? "Professor" :
                          "Unknown";

            await _signInManager.SignInAsync(user, isPersistent: false);

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

            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                return NotFound();

            string role = await _context.Students.AnyAsync(s => s.UserId == user.Id) ? "Student" :
                          await _context.Professors.AnyAsync(p => p.UserId == user.Id) ? "Professor" :
                          "Unknown";

            return Ok(new
            {
                user.Name,
                user.Surname,
                Role = role
            });
        }

        [HttpGet("external-login")]
        public IActionResult ExternalLogin(string provider, string returnUrl = null)
        {
            var redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Account", new { returnUrl });
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);

            if (provider == "Google")
            {
                properties.Items["prompt"] = "select_account";
            }

            return Challenge(properties, provider);
        }

        [HttpGet("external-login-callback")]
        public async Task<IActionResult> ExternalLoginCallback(string returnUrl = null)
        {
            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info == null)
                return Redirect("http://localhost:3000/login"); // fallback if info is null

            ApplicationUser user;

            var signInResult = await _signInManager.ExternalLoginSignInAsync(
                info.LoginProvider,
                info.ProviderKey,
                isPersistent: false);

            if (signInResult.Succeeded)
            {
                user = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
            }
            else
            {
                var email = info.Principal.FindFirstValue(ClaimTypes.Email);
                if (email == null)
                    return Redirect("http://localhost:3000/login"); // fallback if email missing

                user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    user = new ApplicationUser
                    {
                        UserName = email,
                        Email = email,
                        Name = info.Principal.FindFirstValue(ClaimTypes.GivenName),
                        Surname = info.Principal.FindFirstValue(ClaimTypes.Surname)
                    };
                    await _userManager.CreateAsync(user);
                }

                var userLogins = await _userManager.GetLoginsAsync(user);
                if (!userLogins.Any(l => l.LoginProvider == info.LoginProvider && l.ProviderKey == info.ProviderKey))
                {
                    await _userManager.AddLoginAsync(user, info);
                }

                await _signInManager.SignInAsync(user, isPersistent: true);
            }

            // Determine user role
            string role;
            if (await _context.Students.AnyAsync(s => s.UserId == user.Id))
                role = "Student";
            else if (await _context.Professors.AnyAsync(p => p.UserId == user.Id))
                role = "Professor";
            else
                role = "select-role";

            // Redirect to frontend with query parameters so React can log in the user
            var frontendUrl = $"http://localhost:3000/select-role?userId={user.Id}&role={role}&name={user.Name}&surname={user.Surname}";
            return Redirect(frontendUrl);
        }

        [HttpPost("set-role")]
        public async Task<IActionResult> SetRole([FromBody] RoleSelectionModel model)
        {
            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null) return NotFound("User not found");

            if (model.Role == "Student")
                _context.Students.Add(new Student { Id = Guid.NewGuid(), UserId = user.Id });
            else if (model.Role == "Professor")
                _context.Professors.Add(new Professor { Id = Guid.NewGuid(), UserId = user.Id });
            else
                return BadRequest("Invalid role");

            _context.Professors.Add(new Professor { Id = Guid.NewGuid(), UserId = user.Id });
            await _context.SaveChangesAsync();

            return Ok(new
            {
                userId = user.Id,
                user.Name,
                user.Surname,
                role = model.Role
            });
        }

        [HttpPost("get-user")]
        public async Task<IActionResult> GetUser([FromBody] GetUserRequest model)
        {
            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null)
                return NotFound("User not found");

            // Check if the user already has a role
            var role = await _context.Students.AnyAsync(s => s.UserId == user.Id)
                ? "Student"
                : await _context.Professors.AnyAsync(p => p.UserId == user.Id)
                    ? "Professor"
                    : null;

            return Ok(new
            {
                userId = user.Id,
                user.Name,
                user.Surname,
                role
            });
        }

    }
}