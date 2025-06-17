import { Context } from '@oak/oak/context';
import { verify } from '@felix/argon2';
import { defaultHandler, HttpStatus } from "../../routes/main.ts";
import { getUserByEmail } from "../../db.ts";


export default async function authUser(ctx: Context) {
    try {
        const body = await ctx.request.body.formData();
        const email = (body?.get('email')) as string | null;
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
        } else {
            // @ts-ignore: Problem from the compiler, not the code.
            ctx.response.status = HttpStatus.Ok;
            ctx.response.body = {
                message: 'User authenticated successfully!',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                    isAuth: true
                }
            }
        }

    } catch (_error) {
        defaultHandler(ctx, 'Error processing request!', HttpStatus.InternalServerError);
        return;
    }
}