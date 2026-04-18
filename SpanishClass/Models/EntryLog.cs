namespace SpanishClass.Models
{
    public class EntryLog
    {
        public Guid Id { get; set; }

        public Guid BookingId { get; set; }
        public Booking Booking { get; set; }

        public Guid UserId { get; set; }
        public ApplicationUser User { get; set; }

        public DateTime EntryTime { get; set; }
    }
}
