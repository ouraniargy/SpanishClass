namespace SpanishClass.Models.ResponseDtos
{
    public class RegisterViewModel
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Surname { get; set; } = null!;
        public string MobilePhone { get; set; } = null!;
        public IFormFile? Photo { get; set; }
        public string Role { get; set; } = null!;
    }
}
