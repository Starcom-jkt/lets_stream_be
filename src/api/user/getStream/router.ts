import { Router } from "express";
import { getDetailStreamSession, getStreamSession } from "./controller";
import { isLoginUser } from "../../../middleware/auth";

const router = Router();

router.get("/", isLoginUser, getStreamSession);
router.get("/:id", isLoginUser, getDetailStreamSession);

export default router;
