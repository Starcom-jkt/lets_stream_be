import { Router } from "express";
import { index } from "./controller";

const router = Router();

// Rute untuk menampilkan halaman agent
router.get("/", index);

export default router;
