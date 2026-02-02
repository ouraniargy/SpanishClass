namespace SpanishClass.Models
{
    public class ProfessorAvailability
    {
        public Guid Id { get; set; }

        public Guid ProfessorId { get; set; }
        public Professor Professor { get; set; } = null!;

        public Guid LessonId { get; set; }
        public Lesson Lesson { get; set; } = null!;

        public DateOnly Date { get; set; }

        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }

        public int MaxSeats { get; set; }

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
