import { User } from './middleware/users/signup.ts';

const kv = await Deno.openKv();

export async function storeNewUser(user: User) {
    const result = await kv.set(['user', user.email], user);
    if (result.ok) {
        return true;
    } else {
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

export async function deleteUserByEmail(email: string) {
    try {
        await kv.delete(['user', email]);
        return true;
    } catch (_error) {
        return false;   
    }
}