using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
using SpanishClass.Npgsql.Seeder;

namespace SpanishClass.Npgsql
{
    public static class LevelSeeder
    {
        public static void Seed(ModelBuilder builder)
        {
            builder.Entity<Level>().HasData(
                new Level
                {
                    Id = LevelSeederIds.A1,
                    Name = "A1",
                    Description = "Beginner",
                    Price = 50
                },
                new Level
                {
                    Id = LevelSeederIds.A2,
                    Name = "A2",
                    Description = "Elementary",
                    Price = 55
                },
                new Level
                {
                    Id = LevelSeederIds.B1,
                    Name = "B1",
                    Description = "Intermediate",
                    Price = 60
                },
                new Level
                {
                    Id = LevelSeederIds.B2,
                    Name = "B2",
                    Description = "Upper Intermediate",
                    Price = 65
                },
                new Level
                {
                    Id = LevelSeederIds.C1,
                    Name = "C1",
                    Description = "Advanced",
                    Price = 70
                },
                new Level
                {
                    Id = LevelSeederIds.C2,
                    Name = "C2",
                    Description = "Proficiency",
                    Price = 75
                }
            );
        }
    }
}
