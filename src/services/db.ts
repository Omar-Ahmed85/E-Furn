import { User } from '../middleware/users/signup.ts';
import { Session } from './sessions.ts';

const kv = await Deno.openKv();

// #region: Users CRUD

export async function storeNewUser(user: User) {
    try {
        const result = await kv.set(['user', user.email], user);
        if (result.ok) {
            return true;
        } else {
            return false;
        }
    } catch (_error) {
        return false;
    }
}

export async function getUserByEmail(email: string) {
    try {
        const user = await kv.get<User>(['user', email]);
        if (user.value) {
            return user.value as User;
        }
    } catch (_error) {
        return null;
    }
}

export async function deleteUserByEmail(email: string, userId: string) {
    try {
        await kv.delete(['user', email]);
        await deleteAllUserSessions(userId);
        return true;
    } catch (_error) {
        return false;
    }
}

// #endregion

// #region: Sessions CRUD

export async function storeNewSession(sessionId: string, data: Session) {
    try {
        const result = await kv.set(['session', sessionId], data);
        if (result.ok) {
            return true;
        } else {
            return false;
        }
    } catch (_error) {
        return false;
    }
}

export async function getSessionById(sessionId: string) {
    try {
        const result = await kv.get<Session>(['session', sessionId]);
        if (result.value) {
            return result.value as Session;
        } else {
            return null;
        }
    } catch (_error) {
        return null;
    }
}

export async function deleteSessionById(sessionId: string) {
    try {
        await kv.delete(['session', sessionId]);
        return true;
    } catch (_error) {
        return false;
    }
}

export async function deleteAllUserSessions(userId: string) {
    try {
        const entries = kv.list({ prefix: ['session'] });
        for await (const entry of entries) {
            if ((entry.value as Session).userId === userId) {
                await kv.delete(entry.key);
            }
        }
        return true;
    } catch (_error) {
        throw new Error('Failed to delete user sessions!');
    }
}

// #endregion