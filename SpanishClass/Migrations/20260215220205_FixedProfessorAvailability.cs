using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpanishClass.Migrations
{
    /// <inheritdoc />
    public partial class FixedProfessorAvailability : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_ProfessorAvailabilities_ProfessorAvailabilityId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Professors_AvailabilityId",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_ProfessorAvailabilityId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ProfessorAvailabilityId",
                table: "Bookings");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_ProfessorAvailabilities_AvailabilityId",
                table: "Bookings",
                column: "AvailabilityId",
                principalTable: "ProfessorAvailabilities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_ProfessorAvailabilities_AvailabilityId",
                table: "Bookings");

            migrationBuilder.AddColumn<Guid>(
                name: "ProfessorAvailabilityId",
                table: "Bookings",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_ProfessorAvailabilityId",
                table: "Bookings",
                column: "ProfessorAvailabilityId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_ProfessorAvailabilities_ProfessorAvailabilityId",
                table: "Bookings",
                column: "ProfessorAvailabilityId",
                principalTable: "ProfessorAvailabilities",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Professors_AvailabilityId",
                table: "Bookings",
                column: "AvailabilityId",
                principalTable: "Professors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
