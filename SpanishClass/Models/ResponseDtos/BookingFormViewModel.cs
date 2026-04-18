namespace SpanishClass.Models.ResponseDtos
{
    public class BookingFormViewModel
    {
        public Guid AvailabilityId { get; set; }

        public DateTime LessonDate { get; set; }

        public int MaxSeats { get; set; }

        public bool SendEmail { get; set; }
    }

}
