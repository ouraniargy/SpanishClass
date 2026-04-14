using System.Net;
using System.Net.Mail;
using SpanishClass.Models;

namespace SpanishClass.Services
{
    public class EmailService : IEmailService
    {
        private readonly string _smtpUser = "ouraniargy@gmail.com";
        private readonly string _smtpPass = "qzwnvoaxnhlgxolx";
        private readonly string _smtpHost = "smtp.gmail.com";
        private readonly int _smtpPort = 587;

        public async Task SendBookingEmailAsync(BookingDetails? booking)
        {
            using var client = new SmtpClient(_smtpHost, _smtpPort)
            {
                Credentials = new NetworkCredential(_smtpUser, _smtpPass),
                EnableSsl = true
            };

            var message = new MailMessage();
            message.From = new MailAddress(_smtpUser, "Booking System");

            if (booking?.GuestsEmails != null && booking.GuestsEmails.Any())
            {
                foreach (var email in booking.GuestsEmails)
                {
                    if (MailAddress.TryCreate(email, out _))
                        message.To.Add(email);
                }
            }

            if (message.To.Count == 0)
            {
                message.To.Add(_smtpUser);
            }

            message.Subject = "Booking Confirmation";
            message.IsBodyHtml = true;
            message.Body = $@"
                <h2>Booking Confirmation</h2>
                <p><strong>Date:</strong> {booking?.Date:dd/MM/yyyy HH:mm}</p>
                <p><strong>Lesson:</strong> {booking?.LessonName}</p>
                <p><strong>Description:</strong> {booking?.Description}</p>
                <p><strong>Seat Number:</strong> {booking?.SeatNumber}</p>
            ";

            try
            {
                message.CC.Add("ouraniargy@gmail.com");
                await client.SendMailAsync(message);
                Console.WriteLine("EMAIL SENT SUCCESSFULLY");
            }
            catch (Exception ex)
            {
                Console.WriteLine("EMAIL ERROR: " + ex.Message);
                throw;
            }
        }

        public async Task SendNotificationEmailAsync(string email, string subject, string body)
        {
            if (!MailAddress.TryCreate(email, out _))
                return;

            using var client = new SmtpClient(_smtpHost, _smtpPort)
            {
                Credentials = new NetworkCredential(_smtpUser, _smtpPass),
                EnableSsl = true
            };

            var message = new MailMessage
            {
                From = new MailAddress(_smtpUser, "Booking System"),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            message.To.Add(email);

            await client.SendMailAsync(message);
        }
    }
}