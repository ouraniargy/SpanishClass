using Microsoft.AspNetCore.Identity;

namespace SpanishClass.Models
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string Name { get; set; } = null!;
        public string Surname { get; set; } = null!;
        public string? Photo { get; set; }
        public Student? Student { get; set; }
        public Professor? Professor { get; set; }

        public string? AuthProvider { get; set; }
        public string? ProviderId { get; set; }
    }
}
