import { Router } from "express";
import {
  endStreamSession,
  getAllStreamSession,
  getStreamSession,
  startStreamSession,
} from "./controller";

import { isLoginAgent } from "../../../middleware/auth";

const router = Router();

router.get("/", isLoginAgent, getStreamSession);
router.get("/all", getAllStreamSession);
router.post("/", startStreamSession);
router.post("/:id", endStreamSession);

export default router;
