import { Router } from "@oak/oak/router";
import authUser from "../../middleware/users/auth.ts";

const router = new Router();

router.post('/', authUser)

export default router;