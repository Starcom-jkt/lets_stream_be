import { Router } from "express";
import { getTransactionSummary, getTransactions } from "./controller";
import { isLoginAdmin } from "../../../middleware/auth";

const router = Router();

// Rute untuk menampilkan halaman agent
router.get("/", isLoginAdmin, getTransactions);
router.get("/summary", isLoginAdmin, getTransactionSummary);

export default router;
