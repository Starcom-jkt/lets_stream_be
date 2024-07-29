import { Router } from "express";
import {
  endStreamSession,
  getAllStreamSession,
  getDetailStreamSession,
  getStreamSession,
  startStreamSession,
} from "./controller";

import { isLoginAgent } from "../../../middleware/auth";

const router = Router();

router.get("/", isLoginAgent, getStreamSession);
router.get("/all", isLoginAgent, getAllStreamSession);
router.get("/detail/:id", isLoginAgent, getDetailStreamSession);
router.post("/start", isLoginAgent, startStreamSession);
router.post("/end/:id", isLoginAgent, endStreamSession);

export default router;
