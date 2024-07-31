import { Router } from "express";
import { getStreamSession } from "./controller";
import { isLoginViewer } from "../../../middleware/auth";

const router = Router();

router.get("/", isLoginViewer, getStreamSession);

export default router;
