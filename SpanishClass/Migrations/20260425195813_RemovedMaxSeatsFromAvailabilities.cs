using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpanishClass.Migrations
{
    /// <inheritdoc />
    public partial class RemovedMaxSeatsFromAvailabilities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxSeats",
                table: "ProfessorAvailabilities");

            migrationBuilder.CreateIndex(
                name: "IX_EntryLogs_BookingId",
                table: "EntryLogs",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_EntryLogs_UserId",
                table: "EntryLogs",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_EntryLogs_AspNetUsers_UserId",
                table: "EntryLogs",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EntryLogs_Bookings_BookingId",
                table: "EntryLogs",
                column: "BookingId",
                principalTable: "Bookings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EntryLogs_AspNetUsers_UserId",
                table: "EntryLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_EntryLogs_Bookings_BookingId",
                table: "EntryLogs");

            migrationBuilder.DropIndex(
                name: "IX_EntryLogs_BookingId",
                table: "EntryLogs");

            migrationBuilder.DropIndex(
                name: "IX_EntryLogs_UserId",
                table: "EntryLogs");

            migrationBuilder.AddColumn<int>(
                name: "MaxSeats",
                table: "ProfessorAvailabilities",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
