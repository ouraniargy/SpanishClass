using SpanishClass.Models;

public interface IEmailService
{
    Task SendBookingEmailAsync(BookingDetails booking);
}