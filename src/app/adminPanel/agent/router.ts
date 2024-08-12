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

const router = Router();

// Rute untuk menampilkan halaman agent
router.get("/", index);
router.get("/create", indexCreate);
router.post("/create", uploadSingle("profilePicture"), actionCreate);
router.delete("/delete/:id", actionDelete);
router.get("/edit/:id", indexEdit);
router.put("/edit/:id", uploadSingle("profilePicture"), actionEdit);
router.post("/status/:id", changeStatus);
router.post("/stream/:id", changeStatusStream);

export default router;
