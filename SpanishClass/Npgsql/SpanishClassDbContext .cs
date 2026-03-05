using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;

namespace SpanishClass.Npgsql
{
    public class SpanishClassDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
    {
        public SpanishClassDbContext(DbContextOptions<SpanishClassDbContext> options)
        : base(options)
        {
        }

        public DbSet<Student> Students { get; set; }
        public DbSet<Professor> Professors { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Level> Levels { get; set; }
        public DbSet<ApplicationUser> ApplicationUsers { get; set; }
        public DbSet<ProfessorAvailability> ProfessorAvailabilities { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            Seeder.Seeder.Seed(builder);

            builder.Entity<ApplicationUser>()
                .HasIndex(u => u.Email)
                .IsUnique();

            builder.Entity<Student>()
                .HasOne(s => s.User)
                .WithOne(u => u.Student)
                .HasForeignKey<Student>(s => s.UserId);

            builder.Entity<Professor>()
                .HasOne(p => p.User)
                .WithOne(u => u.Professor)
                .HasForeignKey<Professor>(p => p.UserId);
        }
    }
}
