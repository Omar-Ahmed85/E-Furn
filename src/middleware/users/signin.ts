import { Context } from '@oak/oak/context';
import { verify } from '@felix/argon2';
import { defaultHandler, HttpStatus } from "../../routes/main.ts";
import { getUserByEmail } from "../../services/db.ts";
import { createSession } from "../../services/sessions.ts";


export default async function signIn(ctx: Context) {
    try {
        const body = await ctx.request.body.formData();
        const email = ((body?.get('email')) as string | null)?.toLowerCase();
        const password = (body?.get('password')) as string | null;

        if (!body || !email || !password) {
            defaultHandler(ctx, 'Invalid user data!', HttpStatus.BadRequest);
            return;
        }

        const user = await getUserByEmail(email);

        if (!user) {
            defaultHandler(ctx, 'User not found!', HttpStatus.NotFound);
            return;
        }

        const isPasswordValid = await verify(user.password, password);

        if (!isPasswordValid) {
            defaultHandler(ctx, 'Incorrect password!', HttpStatus.Unauthorized);
            return;
        }

        const session = await createSession(user.id);

        if (session.success === false) {
            defaultHandler(ctx, 'Error processing request!', HttpStatus.InternalServerError);
            return;
        } else {

            await ctx.cookies.set('sid', session.sessionId, {
                httpOnly: true,
                secure: Deno.env.get('ENV') === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 // 7 days in seconds.
            });

            // @ts-ignore: Problem from the compiler, not the code.
            ctx.response.status = HttpStatus.Ok;
            ctx.response.body = {
                success: true,
                message: 'User logged in successfully!',
                user: {
                    name: user.name,
                    email: user.email,
                    id: user.id,
                    createdAt: user.createdAt
                }
            };
            
        }

    } catch (_error) {
        defaultHandler(ctx, 'Error processing request!', HttpStatus.InternalServerError);
        return;
    }
}