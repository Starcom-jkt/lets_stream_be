import { Router } from "express";
import {
  endStreamSession,
  getAllStreamSession,
  getDetailStreamSession,
  getStreamSession,
  startStreamSession,
} from "./controller";

import { isLoginUser } from "../../../middleware/auth";
import { uploadSingle } from "../../../middleware/uploadImage";

const router = Router();

router.get("/", isLoginUser, getStreamSession);
router.get("/all", isLoginUser, getAllStreamSession);
router.get("/detail/:id", isLoginUser, getDetailStreamSession);
router.post(
  "/start",
  isLoginUser,
  uploadSingle("thumbnail"),
  startStreamSession
);
router.post("/end", isLoginUser, endStreamSession);

export default router;
