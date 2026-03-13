using System.Data;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
using SpanishClass.Models.RequestDtos;
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
        public async Task<IActionResult> Register([FromForm] RegisterViewModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
                return BadRequest("Email already registered.");

            string? photoPath = null;

            if (model.Photo != null)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(model.Photo.FileName);
                var filePath = Path.Combine("wwwroot/uploads", fileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await model.Photo.CopyToAsync(stream);

                photoPath = "/uploads/" + fileName;
            }

            var user = new ApplicationUser
            {
                UserName = model.Email,
                Id = Guid.NewGuid(),
                Email = model.Email,
                Name = model.Name,
                Surname = model.Surname,
                PhoneNumber = model.MobilePhone,
                Photo = photoPath
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

            await _signInManager.SignInAsync(user, false);

            return Ok(new
            {
                message = "Registration successful",
                userId = user.Id,
                name = user.Name,
                surname = user.Surname,
                role = model.Role,
                photo = user.Photo,
                email = model.Email,
                mobilePhone = model.MobilePhone
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
                return Redirect("http://localhost:3000/login");

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
                    return Redirect("http://localhost:3000/login");

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

            string role;
            if (await _context.Students.AnyAsync(s => s.UserId == user.Id))
                role = "Student";
            else if (await _context.Professors.AnyAsync(p => p.UserId == user.Id))
                role = "Professor";
            else
                role = "select-role";

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
                user.Email,
                role
            });
        }

        [HttpPut("update-user")]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserRequest model)
        {
            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null)
                return NotFound("User not found");

            user.Name = model.Name;
            user.Surname = model.Surname;

            if (!string.IsNullOrEmpty(model.Password))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var result = await _userManager.ResetPasswordAsync(user, token, model.Password);

                if (!result.Succeeded)
                    return BadRequest(result.Errors);
            }

            await _userManager.UpdateAsync(user);

            return Ok(new
            {
                userId = user.Id,
                name = user.Name,
                surname = user.Surname
            });
        }
    }
}