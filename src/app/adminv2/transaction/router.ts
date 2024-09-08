import { Router } from "express";
import { getTransactions } from "./controller";
import { isLoginAdmin } from "../../../middleware/auth";

const router = Router();

// Rute untuk menampilkan halaman agent
router.get("/", isLoginAdmin, getTransactions);

export default router;
