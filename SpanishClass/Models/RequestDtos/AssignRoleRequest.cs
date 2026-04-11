namespace SpanishClass.Models.RequestDtos
{
    public class AssignRoleRequest
    {
        public Guid UserId { get; set; }
        public string Role { get; set; }
    }
}
