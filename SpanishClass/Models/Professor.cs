namespace SpanishClass.Models
{
    public class Professor
    {
        public Guid Id { get; set; }

        //this will be the foreign key with ApplicationUser
        public Guid UserId { get; set; }

        public ApplicationUser User { get; set; } = null!;

        public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();

        public ICollection<Level> Levels { get; set; } = new List<Level>();
    }
}
