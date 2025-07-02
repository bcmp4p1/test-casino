import { Controller, Post, Res, Req, HttpStatus } from '@nestjs/common';
import { SessionService } from './session.service';
import { Response, Request } from 'express';
import { SessionResponseDto } from './session-response.dto';
import { Fruit, FRUIT_REWARDS, SlotResult } from './types';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('/')
  createSession(@Res({ passthrough: true }) res: Response): SessionResponseDto {
    const session = this.sessionService.createSession();
    res.cookie('sessionId', session.id, {
      httpOnly: true,
    });
    return { message: 'Session created', credits: session.credits };
  }

  @Post('/roll')
  roll(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Missing sessionId' });
    }

    const session = this.sessionService.getSession(sessionId);
    if (!session) {
      return res.status(HttpStatus.NOT_FOUND).json({ error: 'Session not found' });
    }

    if (session.credits < 1) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Not enough credits' });
    }


    const fruits = Object.values(Fruit);


    const getRandomFruit = (): Fruit =>
      fruits[Math.floor(Math.random() * fruits.length)] as Fruit;

    const roll = (): SlotResult => [getRandomFruit(), getRandomFruit(), getRandomFruit()];

    let result = roll();
    const [a, b, c] = result;
    let isWin = a === b && b === c;
    let reward = isWin ? FRUIT_REWARDS[a] : 0;

    const currentCredits = session.credits;
    let rerollChance = 0;

    if (isWin) {
      if (currentCredits >= 40 && currentCredits <= 60) {
        rerollChance = 0.3;
      } else if (currentCredits > 60) {
        rerollChance = 0.6;
      }

      if (Math.random() < rerollChance) {
        result = roll();
        const [r1, r2, r3] = result;
        const isRerollWin = r1 === r2 && r2 === r3;

        if (isRerollWin) {
          reward = FRUIT_REWARDS[r1]
          session.credits += reward;
        } else {
          isWin = false;
          session.credits -= 1;
        }
      } else {
        session.credits += reward;
      }
    } else {
      session.credits -= 1;
    }

    this.sessionService.updateSession(session);

    return {
      result,
      isWin,
      reward: isWin ? reward : 0,
      credits: session.credits,
    };
  }
}
