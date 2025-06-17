import { nanoid } from '@sitnik/nanoid';
import { storeNewSession } from './db.ts';

export interface Session {
    userId: string;
    createdAt: number;
    expiresAt: number;
}

export async function createSession(userId: string) {
    try {
        const sessionId = nanoid(30);
        const createdAt = new Date().getTime();
        const expiresAt = new Date(createdAt + (7 * 24 * 60 * 60 * 1000)).getTime(); // Add 7 days.
    
        const data: Session = {
            userId,
            createdAt,
            expiresAt
        };
    
        const result = await storeNewSession(sessionId, data);

        if (!result) {
            return { success: false };
        } else {
            return {
                success: true,
                sessionId
            }
        }

    } catch (_error) {
        return { success: false };
    }
}