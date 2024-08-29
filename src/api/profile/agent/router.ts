import { Router } from "express";
import { getAllAgent } from "./controller";
import { isLoginUser } from "../../../middleware/auth";

const router = Router();

router.get("/", isLoginUser, getAllAgent);
export default router;
