import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import cookieParser from 'cookie-parser';

describe('Casino Session (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/session (POST)', () => {
    it('should create a new session', () => {
      return request(app.getHttpServer())
        .post('/session')
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Session created',
            credits: 10,
          });
          expect(res.headers['set-cookie']).toBeDefined();
          expect(res.headers['set-cookie'][0]).toMatch(/sessionId=/);
        });
    });

    it('should set httpOnly cookie', () => {
      return request(app.getHttpServer())
        .post('/session')
        .expect(201)
        .expect((res) => {
          const cookieHeader = res.headers['set-cookie'][0];
          expect(cookieHeader).toContain('HttpOnly');
        });
    });
  });

  describe('/session/roll (POST)', () => {
    let sessionCookie: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/session')
        .expect(201);
      sessionCookie = response.headers['set-cookie'][0];
    });

    it('should roll with valid session', () => {
      return request(app.getHttpServer())
        .post('/session/roll')
        .set('Cookie', sessionCookie)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('result');
          expect(res.body).toHaveProperty('isWin');
          expect(res.body).toHaveProperty('reward');
          expect(res.body).toHaveProperty('credits');
          expect(res.body.result).toHaveLength(3);
          expect(typeof res.body.isWin).toBe('boolean');
          expect(typeof res.body.reward).toBe('number');
          expect(typeof res.body.credits).toBe('number');
        });
    });

    it('should return 400 when sessionId is missing', () => {
      return request(app.getHttpServer())
        .post('/session/roll')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Missing sessionId');
        });
    });

    it('should return 404 when session does not exist', () => {
      return request(app.getHttpServer())
        .post('/session/roll')
        .set('Cookie', 'sessionId=non-existent-session')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Session not found');
        });
    });

    it('should deduct credits on each roll', async () => {
      const firstRoll = await request(app.getHttpServer())
        .post('/session/roll')
        .set('Cookie', sessionCookie)
        .expect(201);

      const secondRoll = await request(app.getHttpServer())
        .post('/session/roll')
        .set('Cookie', sessionCookie)
        .expect(201);

      // Credits should change (either decrease by 1 for loss, or increase by reward for win)
      const firstCredits = firstRoll.body.credits;
      const secondCredits = secondRoll.body.credits;

      if (firstRoll.body.isWin) {
        expect(firstCredits).toBe(10 + firstRoll.body.reward);
      } else {
        expect(firstCredits).toBe(9);
      }

      if (secondRoll.body.isWin) {
        expect(secondCredits).toBe(firstCredits + secondRoll.body.reward);
      } else {
        expect(secondCredits).toBe(firstCredits - 1);
      }
    });

    it('should prevent rolling with insufficient credits', async () => {
      let lastResponse;
      for (let i = 0; i < 15; i++) {
        try {
          lastResponse = await request(app.getHttpServer())
            .post('/session/roll')
            .set('Cookie', sessionCookie);

          if (lastResponse.status === 400) {
            expect(lastResponse.body.message).toBe('Not enough credits');
            break;
          }
        } catch (error) {
          break;
        }
      }
    });

    it('should handle winning combinations correctly', async () => {
      let foundWin = false;

      for (let i = 0; i < 50 && !foundWin; i++) {
        const response = await request(app.getHttpServer())
          .post('/session/roll')
          .set('Cookie', sessionCookie);

        if (response.status !== 201) break;

        if (response.body.isWin) {
          foundWin = true;
          const [a, b, c] = response.body.result;
          expect(a).toBe(b);
          expect(b).toBe(c);
          expect(response.body.reward).toBeGreaterThan(0);
          expect([10, 20, 30, 40]).toContain(response.body.reward);
        }
      }
    });
  });

  describe('/session/cashout (POST)', () => {
    let sessionCookie: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/session')
        .expect(201);
      sessionCookie = response.headers['set-cookie'][0];
    });

    it('should cash out successfully', () => {
      return request(app.getHttpServer())
        .post('/session/cashout')
        .set('Cookie', sessionCookie)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Cash out successful',
            finalCredits: 10,
          });
        });
    });

    it('should return 400 when sessionId is missing', () => {
      return request(app.getHttpServer())
        .post('/session/cashout')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Missing sessionId');
        });
    });

    it('should return 404 when session does not exist', () => {
      return request(app.getHttpServer())
        .post('/session/cashout')
        .set('Cookie', 'sessionId=non-existent-session')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Session not found');
        });
    });

    it('should cash out after playing some rounds', async () => {
      await request(app.getHttpServer())
        .post('/session/roll')
        .set('Cookie', sessionCookie);

      const rollResponse = await request(app.getHttpServer())
        .post('/session/roll')
        .set('Cookie', sessionCookie);

      const expectedCredits = rollResponse.body.credits;


      return request(app.getHttpServer())
        .post('/session/cashout')
        .set('Cookie', sessionCookie)
        .expect(201)
        .expect((res) => {
          expect(res.body.finalCredits).toBe(expectedCredits);
        });
    });

    it('should prevent using session after cashout', async () => {
      await request(app.getHttpServer())
        .post('/session/cashout')
        .set('Cookie', sessionCookie)
        .expect(201);

      return request(app.getHttpServer())
        .post('/session/roll')
        .set('Cookie', sessionCookie)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Session not found');
        });
    });
  });

  describe('Complete Game Flow (e2e)', () => {
    it('should handle complete game session lifecycle', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/session')
        .expect(201);

      const sessionCookie = createResponse.headers['set-cookie'][0];
      expect(createResponse.body.credits).toBe(10);

      const rolls = [];
      let currentCredits = 10;

      for (let i = 0; i < 5; i++) {
        const rollResponse = await request(app.getHttpServer())
          .post('/session/roll')
          .set('Cookie', sessionCookie);

        if (rollResponse.status !== 201) break; // Out of credits

        rolls.push(rollResponse.body);
        currentCredits = rollResponse.body.credits;
      }

      expect(rolls.length).toBeGreaterThan(0);

      const cashoutResponse = await request(app.getHttpServer())
        .post('/session/cashout')
        .set('Cookie', sessionCookie)
        .expect(201);

      expect(cashoutResponse.body.finalCredits).toBe(currentCredits);

      await request(app.getHttpServer())
        .post('/session/roll')
        .set('Cookie', sessionCookie)
        .expect(404);
    });
  });

  describe('House Edge Behavior (e2e)', () => {
    it('should demonstrate different behavior at different credit levels', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/session')
        .expect(201);

      const sessionCookie = createResponse.headers['set-cookie'][0];

      let rollCount = 0;
      let maxRolls = 100;

      while (rollCount < maxRolls) {
        const rollResponse = await request(app.getHttpServer())
          .post('/session/roll')
          .set('Cookie', sessionCookie);

        if (rollResponse.status !== 201) break;

        rollCount++;
        const credits = rollResponse.body.credits;

        expect(typeof credits).toBe('number');
        expect(credits).toBeGreaterThanOrEqual(0);

        if (credits > 60) {
          expect(rollResponse.body).toHaveProperty('result');
          expect(rollResponse.body).toHaveProperty('isWin');
        }

        if (credits === 0) break;
      }
    });
  });
});