using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpanishClass.Migrations
{
    /// <inheritdoc />
    public partial class AddedBookingDetailsModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RoomPhoto",
                table: "Lessons",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RoomPhoto",
                table: "Lessons");
        }
    }
}
