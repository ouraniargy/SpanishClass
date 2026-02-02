namespace SpanishClass.Models
{
    public class RegisterViewModel
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Surname { get; set; } = null!;

        public string Role { get; set; } = null!;
    }
}
