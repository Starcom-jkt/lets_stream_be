import { Router } from "express";
import { getUserTransactions } from "./controller";
import { isLoginUser } from "../../../middleware/auth";

const router = Router();

router.get("/", isLoginUser, getUserTransactions);
export default router;
