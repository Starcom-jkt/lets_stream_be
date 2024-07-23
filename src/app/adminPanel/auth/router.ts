import { Router } from "express";
import { actionSignin, index } from "./controller";

const router = Router();

router.get("/", index);
router.post("/", actionSignin);

export default router;
