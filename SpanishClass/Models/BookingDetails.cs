namespace SpanishClass.Models
{
    public class BookingDetails
    {
        public Guid BookingId { get; set; }

        public Guid AvailabilityId { get; set; }

        public string StudentName { get; set; } = string.Empty;
        public string StudentEmail { get; set; } = string.Empty;

        public string LessonName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        public int SeatNumber { get; set; }

        public DateTime Date { get; set; }

        public string? LessonPhoto { get; set; }

        public List<string> GuestsEmails { get; set; } = new List<string>();
        public string ProfessorName { get; set; } = string.Empty;
        public string ProfessorSurname { get; set; } = string.Empty;
        public Guid LevelId { get; set; }
        public string Level { get; set; } = null!;

    }
}