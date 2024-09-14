import { Router } from "express";
import {
  getAllStreams,
  getDetailStreamSession,
  launchStream,
  startViewStream,
} from "./controller";

import { isLoginUser } from "../../../middleware/auth";

const router = Router();

router.get("/", getAllStreams);
// router.get("/all", getAllStreamSession);
router.get("/:id", isLoginUser, getDetailStreamSession);
router.get("/launchstream/:id", isLoginUser, launchStream);
router.post("/startview", isLoginUser, startViewStream);

export default router;
