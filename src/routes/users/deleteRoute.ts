import { Router } from "@oak/oak/router";
import deleteUser from "../../middleware/users/delete.ts";

const router = new Router();

router.delete('/', deleteUser);

export default router;