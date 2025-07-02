import { SessionService } from './session.service';
import { Response, Request } from 'express';
import { SessionResponseDto } from './session-response.dto';
import { SlotResult } from './types';
export declare class SessionController {
    private readonly sessionService;
    constructor(sessionService: SessionService);
    createSession(res: Response): SessionResponseDto;
    roll(req: Request, res: Response): Response<any, Record<string, any>> | {
        result: SlotResult;
        isWin: boolean;
        reward: number;
        credits: number;
    };
}
