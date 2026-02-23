namespace SpanishClass.Models.ResponseDtos;
public class CreateLessonDto
{
    public Guid LevelId { get; set; }
    public int DurationMinutes { get; set; }
    public int MaxSeats { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
}

