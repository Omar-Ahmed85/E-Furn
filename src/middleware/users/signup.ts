import { Context } from "@oak/oak/context";
import { nanoid } from '@sitnik/nanoid';
import { hash } from '@felix/argon2';
import { defaultHandler, HttpStatus } from "../../routes/main.ts";
import { storeNewUser, getUserByEmail } from "../../services/db.ts";

export interface User {
    id: string;
    name: string;
    email: string;
    readonly password: string;
    createdAt: number;
}

function validation(email: string, password: string) {
    const emailRegex  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
    const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])[^\s]{8,}$/;

    if (emailRegex.test(email) && passwordRegex.test(password)) {
        return true;
    } else {
        return false;
    }
}

export default async function createUser(ctx: Context) {
    try {
        const body = await ctx.request.body.formData();

        const name = (body?.get('name')) as string | null;
        const email = ((body?.get('email')) as string | null)?.toLowerCase();
        const password = (body?.get('password')) as string | null;;

        if (!body || !name || !email || !password) {
            defaultHandler(ctx, 'Invalid user data!', HttpStatus.BadRequest);
            return;
        }

        const validate = validation(email, password);

        if (!validate) {
            defaultHandler(ctx, 'Invalid email or password format!', HttpStatus.BadRequest);
            return;
        }

        const check = await getUserByEmail(email);

        if (check) {
            ctx.response.status = 200;
            ctx.response.body = {
                success: true,
                message: 'User already exists!',
                user: {
                    name: check.name,
                    email: check.email
                }
            }
            return;
        }

        const user: User = {
            id: nanoid(16),
            name,
            email,
            password: await hash(password),
            createdAt: Date.now()
        };

        const result = await storeNewUser(user);

        if (result) {
            // @ts-ignore: Problem from the compiler, not the code.
            ctx.response.status = HttpStatus.Created;
            ctx.response.body = {
                success: true,
                message: 'User created successfully!',
                user: {
                    name: user.name,
                    email: user.email
                }
            };
        } else {
            defaultHandler(ctx, 'Error storing user data!', HttpStatus.InternalServerError);
            return;
        }
        
    } catch (_error) {
        defaultHandler(ctx, 'Error creating user!', HttpStatus.InternalServerError);
        return;
    }
}