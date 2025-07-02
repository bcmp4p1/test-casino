import { SessionService } from './session.service';
import { Response, Request } from 'express';
import { CashoutResponseDto, ResponseDto, RollResponseDto } from 'src/session/response.dto';
export declare class SessionController {
    private readonly sessionService;
    constructor(sessionService: SessionService);
    createSession(res: Response): ResponseDto;
    roll(req: Request, res: Response): RollResponseDto | Response;
    cashOut(req: Request, res: Response): CashoutResponseDto | Response;
}
