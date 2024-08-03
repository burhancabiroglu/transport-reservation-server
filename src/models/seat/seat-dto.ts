export interface SeatResponse {
  seatId: string;
  transferId: string;
  seatStatus: string;
  userId?: string;
  fullname?: string;
  email?: string;
  informationGiven: boolean;
}
