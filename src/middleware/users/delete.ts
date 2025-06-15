import { Context } from "@oak/oak/context";
import { defaultHandler, HttpStatus } from '../../routes/main.ts';
import { deleteUserByEmail } from "../../db.ts";


export default async function deleteUser(ctx: Context) {
    try {
        const body = await ctx.request.body.json();
    
        if (!body || !body.email) {
            defaultHandler(ctx, 'Invalid user data!', HttpStatus.BadRequest);
            return;
        } else if (!body.isAuth) {
            defaultHandler(ctx, 'User not authenticated!', HttpStatus.Unauthorized);
            return;
        }
    
        const result = await deleteUserByEmail(body.email);
        
        if (!result) {
            defaultHandler(ctx, 'Error deleting user!', HttpStatus.InternalServerError);
            return;
        }

        // @ts-ignore: Problem with the compiler, not the code.
        ctx.response.status = HttpStatus.Ok;
        ctx.response.body = {
            message: 'User deleted successfully!',
            user: {
                email: body.email
            }
        }

    } catch (_error) {
        defaultHandler(ctx, 'Error deleting user!', HttpStatus.InternalServerError);
    }
}