export type QrResponse = {
  qrImageBase64: string;
};

export type Booking = {
  bookingCode: string;
  studentName: string;
  lesson: string;
  description: string;
  date: string;
  seat: number;
};
