import { Router } from "express";
import { getDetailStreamSession } from "./controller";

import { isLoginViewer } from "../../../middleware/auth";

const router = Router();

router.get("/detail/:id", isLoginViewer, getDetailStreamSession);

export default router;
