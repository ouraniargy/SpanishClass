export interface Booking {
  id: string;
  lessonId: string;
  studentId: string;
  createdAt: string;
}

export interface CreateBookingRequest {
  lessonId: string;
}
