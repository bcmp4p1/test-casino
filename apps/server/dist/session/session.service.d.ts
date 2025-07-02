interface Session {
    id: string;
    credits: number;
}
export declare class SessionService {
    private sessions;
    createSession(): Session;
    getSession(id: string): Session | undefined;
    updateSession(session: Session): void;
    deleteSession(id: string): void;
}
export {};
