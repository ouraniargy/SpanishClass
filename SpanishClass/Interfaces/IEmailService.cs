using SpanishClass.Models;

public interface IEmailService
{
    Task SendBookingEmailAsync(BookingDetails? booking);

    Task SendNotificationEmailAsync(string to, string subject, string body);
}