namespace SpanishClass.Models.ResponseDtos
{
    public class CalendarViewModel
    {
        public Guid AvailabilityId { get; set; }

        public DateTime Date { get; set; }

        public string ProfessorName { get; set; } = null!;

        public int MaxSeats { get; set; }
        public int BookedSeats { get; set; }

        public List<string> StudentNames { get; set; } = new();
    }
}
