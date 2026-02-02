using Microsoft.AspNetCore.Identity;

namespace SpanishClass.Models
{
    public class ApplicationUser
    {
        public Guid Id { get; set; }

        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;

        public string Name { get; set; } = null!;
        public string Surname { get; set; } = null!;

        public Student? Student { get; set; }
        public Professor? Professor { get; set; }
    }
}
