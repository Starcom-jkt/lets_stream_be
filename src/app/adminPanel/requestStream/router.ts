import { Router } from "express";
import {
  actionDelete,
  index,
  requestDetail,
  rejectStream,
  confirmStream,
} from "./controller";

const router = Router();

// Rute untuk menampilkan halaman agent
router.get("/", index);
router.get("/detail/:id", requestDetail);
router.delete("/delete/:id", actionDelete);
router.post("/confirm/:id", confirmStream);
router.delete("/reject/:id", rejectStream);

export default router;
