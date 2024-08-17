import { Router } from "express";
import { getAllNotifications, getDetailNotifications } from "./controller";
import { isLoginUser } from "../../middleware/auth";

const router = Router();

router.get("/", isLoginUser, getAllNotifications);
router.get("/:id", getDetailNotifications);

export default router;
