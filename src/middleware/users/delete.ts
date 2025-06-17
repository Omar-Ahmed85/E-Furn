import { Context } from "@oak/oak/context";
import { defaultHandler, HttpStatus } from '../../routes/main.ts';
import { getUserByEmail, deleteUserByEmail } from "../../services/db.ts";


export default async function deleteUser(ctx: Context) {
    try {
        const body = await ctx.request.body.json();
    
        if (!body || !body.email) {
            defaultHandler(ctx, 'Invalid user data!', HttpStatus.BadRequest);
            return;
        }
    
        const user = await getUserByEmail(body.email.toLowerCase());

        if (!user) {
            defaultHandler(ctx, 'User not found!', HttpStatus.NotFound);
            return;
        }

        const result = await deleteUserByEmail(user.email.toLowerCase(), user.id);
        
        if (!result) {
            defaultHandler(ctx, 'Error deleting user!', HttpStatus.InternalServerError);
            return;
        }

        await ctx.cookies.delete('sid');
        
        // @ts-ignore: Problem with the compiler, not the code.
        ctx.response.status = HttpStatus.Ok;
        ctx.response.redirect('/');

    } catch (_error) {
        defaultHandler(ctx, 'Error deleting user!', HttpStatus.InternalServerError);
    }
}