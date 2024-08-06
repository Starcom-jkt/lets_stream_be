import { Router } from "express";
import { getAllStreams, getDetailStreamSession } from "./controller";

import { isLoginUser } from "../../../middleware/auth";
import { uploadSingle } from "../../../middleware/uploadImage";

const router = Router();

router.get("/", getAllStreams);
// router.get("/all", getAllStreamSession);
router.get("/:id", getDetailStreamSession);

export default router;
