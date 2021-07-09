export interface TransferStatementRequestDto {
  sender_user_id: string;
  destination_user_id: string;
  amount: number;
  description: string;
}
