import { Router } from "express";
import { getDetailStreamResult, getAllStreamResults } from "./controller";

import { isLoginAgent } from "../../../middleware/auth";

const router = Router();

router.get("/", isLoginAgent, getAllStreamResults);
router.get("/:id", isLoginAgent, getDetailStreamResult);

export default router;
