import { Router } from "express";
import {
  actionCreate,
  actionDelete,
  index,
  indexCreate,
  actionEdit,
  indexEdit,
  changeStatus,
  changeStatusStream,
} from "./controller";
import { uploadSingle } from "../../../middleware/uploadImage";
import { isLoginAdmin } from "../../../middleware/auth";

const router = Router();

// Rute untuk menampilkan halaman agent
router.get("/", isLoginAdmin, index);
router.get("/create", isLoginAdmin, indexCreate);
router.post(
  "/create",
  isLoginAdmin,
  uploadSingle("profilePicture"),
  actionCreate
);
router.delete("/delete/:id", isLoginAdmin, actionDelete);
router.get("/edit/:id", isLoginAdmin, indexEdit);
router.put(
  "/edit/:id",
  isLoginAdmin,
  uploadSingle("profilePicture"),
  actionEdit
);
router.post("/status/:id", isLoginAdmin, changeStatus);
router.post("/stream/:id", isLoginAdmin, changeStatusStream);

export default router;
