export type Fruit = 'C' | 'L' | 'O' | 'W';

export interface RollResponse {
  result: Fruit[];
  isWin: boolean;
  reward: number;
  credits: number;
}

export interface SessionResponse {
  message: string;
  credits: number;
}
