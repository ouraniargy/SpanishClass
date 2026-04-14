namespace SpanishClass.Models
{
    public class Booking
    {
        public Guid Id { get; set; }

        public Guid LessonId { get; set; }
        public Lesson Lesson { get; set; } = null!;

        public Guid StudentId { get; set; }
        public Student Student { get; set; } = null!;
        public bool Used { get; set; }

        public Guid AvailabilityId { get; set; }
        public ProfessorAvailability Availability { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int SeatNumber { get; set; }
    }
}
