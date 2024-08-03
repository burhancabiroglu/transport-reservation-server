export interface SeatDAO {
  seatId: string;
  transferId: string;
  seatStatus: string;
  userId?: string;
  message?: string;
  informationGiven: boolean;
}
