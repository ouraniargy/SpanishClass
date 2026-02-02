namespace SpanishClass.Models
{
    public class Professor
    {
        public Guid Id { get; set; }

        //this will be the foreign key with ApplicationUser
        public Guid UserId { get; set; }

        public ApplicationUser User { get; set; } = null!;

        public Guid LessonId { get; set; }

        public Lesson Lesson { get; set; } = null!;

        public ICollection<Level> Levels { get; set; } = new List<Level>();
    }
}
