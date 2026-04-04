using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpanishClass.Migrations
{
    /// <inheritdoc />
    public partial class AddedLessonPhoto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RoomPhoto",
                table: "Lessons",
                newName: "LessonPhoto");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "LessonPhoto",
                table: "Lessons",
                newName: "RoomPhoto");
        }
    }
}
