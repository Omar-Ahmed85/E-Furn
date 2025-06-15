import { Router } from '@oak/oak/router';
import { send } from "@oak/oak/send";
import { Context } from "@oak/oak/context";
import signupRoute from './users/signupRoute.ts';
import authRoute from './users/authRoute.ts';
import deleteRoute from './users/deleteRoute.ts';

const router = new Router();

export enum HttpStatus {
    Ok = 200,
    Created = 201,
    BadRequest = 400,
    Unauthorized = 401,
    NotFound = 404,
    InternalServerError = 500
}

export function defaultHandler(ctx: Context, error?: string, statusCode?: number) {
    ctx.response.status = statusCode || 500;
    ctx.response.body = {
        error: error || 'An error occurred!',
        requestUrl: ctx.request.url.href,
        method: ctx.request.method
    }
}

router.post('/user/signup', signupRoute.routes(), signupRoute.allowedMethods());
router.post('/user/auth', authRoute.routes(), authRoute.allowedMethods());
router.delete('/user/delete/', deleteRoute.routes(), deleteRoute.allowedMethods());


// #region Static file serving routes

// Route to serve the index.html file.
router.get('/', async (ctx) => {
    try {
        await send(ctx, 'index.html', {
            root: `${Deno.cwd()}/public`,
            index: 'index.html'
        });
    } catch (_error) {
        defaultHandler(ctx, 'Error serving index.html!', HttpStatus.InternalServerError);
    }
});

// Route to serve all the assets.
router.get('/assets/(.*)', async (ctx) => {
    try {
        await send(ctx, ctx.params[0], {
            root: `${Deno.cwd()}/public/assets`,
            index: 'index.html'
        });
    } catch (_error) {
        defaultHandler(ctx, `Asset ${ctx.params[0]} not found!`, HttpStatus.NotFound);
    }
});

// #endregion

// Fallback route for 404 - Not found
router.all('/(.*)', (ctx) => {
    defaultHandler(ctx, 'Page not found!', HttpStatus.NotFound);
});

export default router;