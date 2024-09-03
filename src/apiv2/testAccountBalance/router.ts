import { Router } from "express";
import {
  deductBalance,
  getAllUser,
  getBalance,
  getBalanceWebhook,
  login,
  register,
} from "./controller";

const router = Router();

router.post("/balance", getBalance);
router.post("/get-balance", getBalanceWebhook);
router.post("/deduct", deductBalance);
router.post("/login", login);
router.post("/register", register);
router.get("/get", getAllUser);
export default router;
