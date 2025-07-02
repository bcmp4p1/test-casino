import { Fruit } from './types';

export class ResponseDto {
  message: string;
  credits: number;
}

export class RollResponseDto {
  result: [Fruit, Fruit, Fruit];
  isWin: boolean;
  reward: number;
  credits: number;
}

export class CashoutResponseDto {
  message: string;
  finalCredits: number;
}