import { Router } from "express";
import {
  actionCreate,
  actionDelete,
  index,
  indexCreate,
  actionEdit,
  indexEdit,
} from "./controller";
import { uploadSingle } from "../../../middleware/uploadImage";
import { isLoginAdmin } from "../../../middleware/auth";

const router = Router();

// Rute untuk menampilkan halaman agent
router.get("/", isLoginAdmin, index);
router.get("/create", isLoginAdmin, indexCreate);
router.post("/create", isLoginAdmin, uploadSingle("img"), actionCreate);
router.delete("/delete/:id", isLoginAdmin, actionDelete);
router.get("/edit/:id", isLoginAdmin, indexEdit);
router.put("/edit/:id", isLoginAdmin, actionEdit);

export default router;
