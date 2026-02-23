using System.Net;
using System.Net.Mail;
using SpanishClass.Models;

namespace SpanishClass.Services
{
    public class EmailService : IEmailService
    {
        private readonly string _smtpUser = "ouraniargy@gmail.com";
        private readonly string _smtpPass = "qzwn voax nhlg xolx";
        private readonly string _smtpHost = "smtp.gmail.com";
        private readonly int _smtpPort = 587;

        public async Task SendBookingEmailAsync(BookingDetails booking)
        {
            using var client = new SmtpClient(_smtpHost, _smtpPort)
            {
                Credentials = new NetworkCredential(_smtpUser, _smtpPass),
                EnableSsl = true
            };

            var message = new MailMessage();
            message.From = new MailAddress(_smtpUser, "Booking System");

            foreach (var email in booking.GuestsEmails)
                message.To.Add(email);

            message.Subject = "Booking Confirmation";
            message.IsBodyHtml = true;
            message.Body = $@"
                <h2>Booking Confirmation</h2>
                <p><strong>Date:</strong> {booking.Date:dd/MM/yyyy HH:mm}</p>
                <p><strong>Lesson:</strong> {booking.LessonName}</p>
                <p><strong>Description:</strong> {booking.Description}</p>
                <p><strong>Seat Number:</strong> {booking.SeatNumber}</p>
                <img src='{booking.RoomPhoto}' alt='Room' style='max-width:400px;' />
            ";

            await client.SendMailAsync(message);
        }
    }
}