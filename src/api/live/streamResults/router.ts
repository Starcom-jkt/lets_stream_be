import { Router } from "express";
import { getDetailStreamResult, getAllStreamResults } from "./controller";

import { isLoginUser } from "../../../middleware/auth";

const router = Router();

router.get("/", isLoginUser, getAllStreamResults);
router.get("/:id", isLoginUser, getDetailStreamResult);

export default router;
