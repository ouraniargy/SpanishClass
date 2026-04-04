namespace SpanishClass.Models.RequestDtos;

public class UpdateLessonDto
{
    public int DurationMinutes { get; set; }
    public int MaxSeats { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public IFormFile? LessonPhoto { get; set; }
};
