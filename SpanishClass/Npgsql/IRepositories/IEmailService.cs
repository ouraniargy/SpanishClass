using SpanishClass.Models.ResponseDtos;

public interface IEmailService
{
    Task SendBookingEmailAsync(BookingDetails? booking);

    Task SendNotificationEmailAsync(string to, string subject, string body);
}