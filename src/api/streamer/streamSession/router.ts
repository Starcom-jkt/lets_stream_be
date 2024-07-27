import { Router } from "express";
import { getAllStreamSession } from "./controller";

const router = Router();

router.get("/", getAllStreamSession);

export default router;
