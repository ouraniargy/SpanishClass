namespace SpanishClass.Models.RequestDtos;
public class AddAvailabilityRequestDto
{
    public Guid LessonId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int MaxSeats { get; set; }
    public Guid ProfessorId { get; set; }
    public DateTime Date { get; set; }
}
