namespace SpanishClass.Models.RequestDtos;

public class SearchBookingRequest
{
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Id { get; set; }
    public string? LessonName { get; set; }
    public bool OnlyMine { get; set; }
    public int SeatNumber { get; set; }
}