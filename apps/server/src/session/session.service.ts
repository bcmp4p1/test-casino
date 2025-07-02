import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

interface Session {
  id: string;
  credits: number;
}

@Injectable()
export class SessionService {
  private sessions = new Map<string, Session>();

  createSession(): Session {
    const id = randomUUID();
    const newSession: Session = {
      id,
      credits: 10,
    };
    this.sessions.set(id, newSession);
    return newSession;
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  updateSession(id: string, session: Session) {
    this.sessions.set(id, session);
  }

  deleteSession(id: string) {
    this.sessions.delete(id);
  }
}
