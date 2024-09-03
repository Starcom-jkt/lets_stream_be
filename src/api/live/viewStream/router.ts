import { Router } from "express";
import {
  getAllStreams,
  getDetailStreamSession,
  launchStream,
} from "./controller";

import { isLoginUser } from "../../../middleware/auth";

const router = Router();

router.get("/", getAllStreams);
// router.get("/all", getAllStreamSession);
router.get("/:id", getDetailStreamSession);
router.get("/launchstream/:id", isLoginUser, launchStream);

export default router;
