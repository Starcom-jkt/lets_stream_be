import { Router } from "express";
import {
  endStreamSession,
  getStreamSession,
  launchLobby,
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
router.get("/launchlobby", isLoginUser, launchLobby);

export default router;
