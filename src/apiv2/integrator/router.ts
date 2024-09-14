import { Router } from "express";
import {
  addBalance,
  deductBalance,
  getAllUser,
  getBalance,
  getBalanceWebhook,
  login,
  register,
} from "./controller";
// import { getupdatedetailpolling } from "../../api/profile/auth/controller";

const router = Router();

router.post("/balance", getBalance);
router.post("/get-balance", getBalanceWebhook);
router.post("/deduct", deductBalance);
router.post("/login", login);
router.post("/add", addBalance);
router.post("/register", register);
router.get("/get", getAllUser);

// router.post("/testDetail", getupdatedetailpolling);
export default router;
