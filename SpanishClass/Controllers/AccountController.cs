using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SpanishClass.Models;
using SpanishClass.Models.RequestDtos;
using SpanishClass.Models.ResponseDtos;
using SpanishClass.Npgsql.IRepositories;

namespace SpanishClass.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : BaseController
    {
        private readonly IAccountRepository _accountRepo;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public AccountController(
            IBookingRepository bookingRepository,
            IAccountRepository accountRepo,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager)
             : base(bookingRepository)
        {
            _accountRepo = accountRepo;
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
            {
                return BadRequest(new
                {
                    code = "EMAIL_EXISTS",
                    message = "Email already registered."
                });
            }

            string? photoPath = null;

            if (model.Photo != null)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = Guid.NewGuid() + Path.GetExtension(model.Photo.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await model.Photo.CopyToAsync(stream);
                photoPath = fileName;
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
            {
                return BadRequest(new
                {
                    code = "VALIDATION_ERROR",
                    errors = createResult.Errors.Select(e => e.Description)
                });
            }

            if (model.Role == "Professor")
                await _accountRepo.AddProfessorAsync(user.Id);
            else if (model.Role == "Student")
                await _accountRepo.AddStudentAsync(user.Id);
            else if (model.Role == "Admin")
                await _accountRepo.AddAdminAsync(user.Id);

            await _signInManager.SignInAsync(user, false);

            await _accountRepo.SaveChangesAsync();

            return Ok(new
            {
                message = "Registration successful",
                userId = user.Id,
                name = user.Name,
                surname = user.Surname,
                role = model.Role,
                photo = user.Photo,
                email = user.Email,
                mobilePhone = user.PhoneNumber
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

            string role = await _accountRepo.IsAdminAsync(user.Id) ? "Admin" :
                          await _accountRepo.IsStudentAsync(user.Id) ? "Student" :
                          await _accountRepo.IsProfessorAsync(user.Id) ? "Professor" :
                          "Unknown";

            await _signInManager.SignInAsync(user, isPersistent: false);

            return Ok(new
            {
                message = "Login successful",
                userId = user.Id,
                name = user.Name,
                surname = user.Surname,
                role,
                profilePicture = user.Photo
            });
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = LoggedInUserId;
            if (!userId.HasValue) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) return NotFound();

            string role = await _accountRepo.IsAdminAsync(user.Id) ? "Admin" :
                          await _accountRepo.IsStudentAsync(user.Id) ? "Student" :
                          await _accountRepo.IsProfessorAsync(user.Id) ? "Professor" :
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
                properties.Items["prompt"] = "select_account";

            return Challenge(properties, provider);
        }

        [HttpGet("external-login-callback")]
        public async Task<IActionResult> ExternalLoginCallback(string returnUrl = null)
        {
            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info == null)
                return Redirect("http://localhost:3000/login");

            ApplicationUser user;

            var signInResult = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, isPersistent: false);

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

            string role = await _accountRepo.IsAdminAsync(user.Id) ? "Admin" :
                          await _accountRepo.IsStudentAsync(user.Id) ? "Student" :
                          await _accountRepo.IsProfessorAsync(user.Id) ? "Professor" :
                          "select-role";

            var frontendUrl = $"http://localhost:3000/select-role?userId={user.Id}&role={role}&name={user.Name}&surname={user.Surname}&profilePicture={user.Photo}";
            return Redirect(frontendUrl);
        }

        [HttpPost("set-role")]
        public async Task<IActionResult> SetRole([FromBody] RoleSelectionModel model)
        {
            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null) return NotFound("User not found");

            if (model.Role == "Student")
                await _accountRepo.AddStudentAsync(user.Id);
            else if (model.Role == "Professor")
                await _accountRepo.AddProfessorAsync(user.Id);
            else if (model.Role == "Admin")
                await _accountRepo.AddAdminAsync(user.Id);
            else
                return BadRequest("Invalid role");

            await _accountRepo.SaveChangesAsync();

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

            string? role = await _accountRepo.IsAdminAsync(user.Id) ? "Admin" :
                           await _accountRepo.IsStudentAsync(user.Id) ? "Student" :
                           await _accountRepo.IsProfessorAsync(user.Id) ? "Professor" :
                           null;

            var hasPassword = await _userManager.HasPasswordAsync(user);

            return Ok(new
            {
                userId = user.Id,
                name = user.Name,
                surname = user.Surname,
                email = user.Email,
                profilePicture = user.Photo,
                role,
                hasPassword
            });
        }

        [HttpPut("update-user")]
        public async Task<IActionResult> UpdateUser(
    [FromForm] string userId,
    [FromForm] string name,
    [FromForm] string surname,
    [FromForm] string? oldPassword,
    [FromForm] string? newPassword,
    IFormFile? photo)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound();

            var hasPassword = await _userManager.HasPasswordAsync(user);

            if (hasPassword)
            {
                if (string.IsNullOrEmpty(oldPassword))
                    return BadRequest("Password is required.");

                var isValid = await _userManager.CheckPasswordAsync(user, oldPassword);
                if (!isValid)
                    return BadRequest("Password is incorrect.");
            }

            if (!string.IsNullOrEmpty(newPassword))
            {
                if (hasPassword)
                {
                    var result = await _userManager.ChangePasswordAsync(
                        user,
                        oldPassword,
                        newPassword
                    );

                    if (!result.Succeeded)
                        return BadRequest(result.Errors);
                }
                else
                {
                    var result = await _userManager.AddPasswordAsync(user, newPassword);

                    if (!result.Succeeded)
                        return BadRequest(result.Errors);
                }
            }

            user.Name = name;
            user.Surname = surname;

            if (photo != null)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = Guid.NewGuid() + Path.GetExtension(photo.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await photo.CopyToAsync(stream);

                user.Photo = fileName;
            }

            await _userManager.UpdateAsync(user);

            return Ok(new { profilePicture = user.Photo });
        }

        [HttpPost("assign-role")]
        public async Task<IActionResult> AssignRole([FromBody] AssignRoleRequest model)
        {
            var userId = LoggedInUserId;
            if (!userId.HasValue)
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(model.UserId.ToString());
            if (user == null) return NotFound("User not found");

            var isAdmin = await _accountRepo.IsAdminAsync(userId.Value);
            if (!isAdmin)
                return Forbid();

            if (model.UserId == userId.Value)
                return BadRequest("You cannot change your own role");

            await _accountRepo.RemoveStudentAsync(model.UserId);
            await _accountRepo.RemoveProfessorAsync(model.UserId);
            await _accountRepo.RemoveAdminAsync(model.UserId);

            if (model.Role == "Student")
                await _accountRepo.AddStudentAsync(model.UserId);

            else if (model.Role == "Professor")
                await _accountRepo.AddProfessorAsync(model.UserId);

            else if (model.Role == "Admin")
                await _accountRepo.AddAdminAsync(model.UserId);

            else
                return BadRequest("Invalid role");

            await _accountRepo.SaveChangesAsync();

            return Ok("Role updated successfully");
        }
    }
}