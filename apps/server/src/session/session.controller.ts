import {
  Controller,
  Post,
  Res,
  Req,
  HttpStatus,
  HttpCode,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { Response, Request } from 'express';
import { CashoutResponseDto, ResponseDto, RollResponseDto } from './response.dto';
import { Fruit, FRUIT_REWARDS, SlotResult } from './types';
import { CHEATING_THRESHOLDS } from '../constants/cheatingTresholds';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('/')
  @HttpCode(201)
  createSession(@Res({ passthrough: true }) res: Response): ResponseDto {
    const session = this.sessionService.createSession();
    res.cookie('sessionId', session.id, {
      httpOnly: true,
    });
    return { message: 'Session created', credits: session.credits };
  }

  @Post('/roll')
  @HttpCode(201)
  roll(@Req() req: Request, @Res({ passthrough: true }) res: Response): RollResponseDto | Response {
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      throw new BadRequestException('Missing sessionId');
    }

    const session = this.sessionService.getSession(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.credits < 1) {
      throw new BadRequestException('Not enough credits');
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
      if (currentCredits >= CHEATING_THRESHOLDS.LOW && currentCredits <= CHEATING_THRESHOLDS.HIGH) {
        rerollChance = CHEATING_THRESHOLDS.REROLL_CHANCES.MEDIUM;
      } else if (currentCredits > CHEATING_THRESHOLDS.HIGH) {
        rerollChance = CHEATING_THRESHOLDS.REROLL_CHANCES.HIGH;
      }

      if (Math.random() < rerollChance) {
        result = roll();
        const [r1, r2, r3] = result;
        const isRerollWin = r1 === r2 && r2 === r3;

        if (isRerollWin) {
          reward = FRUIT_REWARDS[r1];
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
      reward,
      credits: session.credits,
    };
  }

  @Post('/cashout')
  cashOut(@Req() req: Request, @Res({ passthrough: true }) res: Response): CashoutResponseDto | Response {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      throw new BadRequestException('Missing sessionId');
    }

    const session = this.sessionService.getSession(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const finalCredits = session.credits;

    this.sessionService.deleteSession(sessionId);

    return {
      message: 'Cash out successful',
      finalCredits,
    };
  }
}
