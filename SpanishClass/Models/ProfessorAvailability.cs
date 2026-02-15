namespace SpanishClass.Models
{
    public class ProfessorAvailability
    {
        public Guid Id { get; set; }

        public Guid ProfessorId { get; set; }
        public Professor Professor { get; set; } = null!;

        public Guid LessonId { get; set; }
        public Lesson Lesson { get; set; } = null!;

        public DateTime Date { get; set; }

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        public int MaxSeats { get; set; }
        public int BookedSeats { get; set; }

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
