import { Router } from "@oak/oak/router";
import createUser from "../../middleware/users/signup.ts";

const router = new Router();

router.post('/', createUser);

export default router;