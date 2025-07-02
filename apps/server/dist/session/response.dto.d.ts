import { Fruit } from './types';
export declare class ResponseDto {
    message: string;
    credits: number;
}
export declare class RollResponseDto {
    result: [Fruit, Fruit, Fruit];
    isWin: boolean;
    reward: number;
    credits: number;
}
export declare class CashoutResponseDto {
    message: string;
    finalCredits: number;
}
