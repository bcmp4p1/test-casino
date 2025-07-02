import { Controller, Post, Res } from '@nestjs/common';
import { SessionService } from './session.service';
import { Response } from 'express';
import { SessionResponseDto } from './session-response.dto';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  createSession(@Res({ passthrough: true }) res: Response): SessionResponseDto {
    const session = this.sessionService.createSession();
    res.cookie('sessionId', session.id, {
      httpOnly: true,
    });
    return { message: 'Session created', credits: session.credits };
  }
}
