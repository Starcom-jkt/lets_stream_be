import { Router } from "express";
import { index } from "./controller";
import { isLoginAdmin } from "../../../middleware/auth";

const router = Router();

// router.use(isLoginAdmin);
router.get("/", isLoginAdmin, index);
// router.get("/", index);

export default router;
