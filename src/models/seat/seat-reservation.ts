export interface SeatReservation {
  seatId: string;
  transferId: string;
  seatStatus: string;
  userId?: string;
  fullname?: string;
  email?: string;
  transferStatus: string,
  transferType: string,
  plannedAt: string,
}
  