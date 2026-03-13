namespace SpanishClass.Models.RequestDtos
{
    public class UpdateUserRequest
    {
        public string UserId { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string? Password { get; set; }
    }
}
