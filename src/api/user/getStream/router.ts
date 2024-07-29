import { Router } from "express";
import { getStreamSession } from "./controller";

const router = Router();

router.get("/", getStreamSession);

export default router;
