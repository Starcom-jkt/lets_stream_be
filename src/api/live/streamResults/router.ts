import { Router } from "express";
import {
  getDetailStreamResult,
  getAllStreamResults,
  getTotalStream,
} from "./controller";

import { isLoginUser } from "../../../middleware/auth";

const router = Router();

// router.get("/taol", isLoginUser, getAllStreamResults);
router.get("/total", isLoginUser, getTotalStream);
router.get("/:id", isLoginUser, getDetailStreamResult);

export default router;
