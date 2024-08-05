import { Router } from "express";
import { actionLogout, actionSignin, index } from "./controller";

const router = Router();

router.get("/", index);
router.post("/", actionSignin);
router.post("/logout", actionLogout);

export default router;
