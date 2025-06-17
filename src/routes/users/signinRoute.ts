import { Router } from "@oak/oak/router";
import signin from "../../middleware/users/signin.ts";

const router = new Router();

router.post('/', signin)

export default router;