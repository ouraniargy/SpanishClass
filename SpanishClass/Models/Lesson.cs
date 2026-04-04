namespace SpanishClass.Models
{
    public class Lesson
    {
        public Guid Id { get; set; }

        public Guid ProfessorId { get; set; }
        public Professor Professor { get; set; } = null!;

        public Guid LevelId { get; set; }
        public Level Level { get; set; } = null!;

        public int DurationMinutes { get; set; }
        public required string Description { get; set; }
        public string? LessonPhoto { get; set; }

        public int MaxSeats { get; set; }
        public required string Name { get; set; }

        public ICollection<ProfessorAvailability> ProfessorAvailabilities { get; set; } = new List<ProfessorAvailability>();

    }
}
