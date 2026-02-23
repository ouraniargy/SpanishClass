using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpanishClass.Migrations
{
    /// <inheritdoc />
    public partial class AddedDesciptionInLessonModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "LessonName",
                table: "Lessons",
                newName: "Name");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Lessons",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Lessons");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Lessons",
                newName: "LessonName");
        }
    }
}
