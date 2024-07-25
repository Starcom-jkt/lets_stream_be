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

const router = Router();

// Rute untuk menampilkan halaman agent
router.get("/", index);
router.get("/create", indexCreate);
router.post("/create", uploadSingle("profile_picture"), actionCreate);
router.delete("/delete/:id", actionDelete);
router.get("/edit/:id", indexEdit);
router.put("/edit/:id", actionEdit);

export default router;
