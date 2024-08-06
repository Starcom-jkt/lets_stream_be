import { Router } from "express";
import { getDetailStreamSession } from "./controller";

import { isLoginUser } from "../../../middleware/auth";

const router = Router();

router.get("/detail/:id", isLoginUser, getDetailStreamSession);

export default router;
