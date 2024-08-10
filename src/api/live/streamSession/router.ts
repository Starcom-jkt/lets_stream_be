import { Router } from "express";
import {
  endStreamSession,
  getStreamSession,
  startStreamSession,
} from "./controller";

import { isLoginUser } from "../../../middleware/auth";
import { uploadSingle } from "../../../middleware/uploadImage";

const router = Router();

router.get("/", isLoginUser, getStreamSession);
router.post(
  "/start",
  isLoginUser,
  uploadSingle("thumbnail"),
  startStreamSession
);
router.post("/end", isLoginUser, endStreamSession);

export default router;
