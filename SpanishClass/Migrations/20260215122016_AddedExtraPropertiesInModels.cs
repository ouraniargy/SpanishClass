using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpanishClass.Migrations
{
    /// <inheritdoc />
    public partial class AddedExtraPropertiesInModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LessonName",
                table: "Lessons",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LessonName",
                table: "Lessons");
        }
    }
}
