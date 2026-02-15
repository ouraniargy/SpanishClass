namespace SpanishClass.Models.RequestDtos;

public class UpdateLessonDto
{
    public int DurationMinutes { get; set; }
    public int MaxSeats { get; set; }
    public required string LessonName { get; set; }
};
