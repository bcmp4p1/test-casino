import { SessionService } from './session.service';
import { Response } from 'express';
import { SessionResponseDto } from './session-response.dto';
export declare class SessionController {
    private readonly sessionService;
    constructor(sessionService: SessionService);
    createSession(res: Response): SessionResponseDto;
}
