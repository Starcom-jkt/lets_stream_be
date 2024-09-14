import { Router } from "express";
import {
  actionCreate,
  actionDelete,
  index,
  indexCreate,
  actionEdit,
  indexEdit,
  changeStatus,
  // changeStatusStream,
  getUserLiveStreamReport,
} from "./controller";
import { uploadSingle } from "../../../middleware/uploadImage";
import { isLoginAdmin } from "../../../middleware/auth";

const router = Router();

// Rute untuk menampilkan halaman agent
router.get("/", index);
router.get("/create", indexCreate);
router.post(
  "/create",

  uploadSingle("profilePicture"),
  actionCreate
);
router.delete("/delete/:id", actionDelete);
router.get("/edit/:id", indexEdit);
router.put(
  "/edit/:id",

  uploadSingle("profilePicture"),
  actionEdit
);
router.post("/status/:id", changeStatus);
router.get("/live_report/:id", getUserLiveStreamReport);

export default router;
