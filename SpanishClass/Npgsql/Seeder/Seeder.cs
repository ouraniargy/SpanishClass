using Microsoft.EntityFrameworkCore;

namespace SpanishClass.Npgsql.Seeder
{
    public static class Seeder
    {
        public static void Seed(ModelBuilder builder)
        {
            LevelSeeder.Seed(builder);
        }
    }
}
