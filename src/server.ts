import { Application } from '@oak/oak/application';
import mainRoute from './routes/main.ts'; 

const app = new Application();
const PORT = 8000;

app.use(mainRoute.routes());
app.use(mainRoute.allowedMethods());

app.listen({ port: PORT, hostname: 'localhost', });