import { Router } from "express";
import {
  deleteGift,
  editGift,
  getAllGifts,
  getDetailGift,
  postGift,
} from "./controller";
import { isLoginViewer } from "../../../middleware/auth";
import { uploadSingle } from "../../../middleware/uploadImage";

const router = Router();

router.get("/", isLoginViewer, getAllGifts);
router.get("/:id", isLoginViewer, getDetailGift);
router.post("/", uploadSingle("img"), isLoginViewer, postGift);
router.put("/edit/:id", uploadSingle("img"), isLoginViewer, editGift);
router.delete("/delete/:id", isLoginViewer, deleteGift);

export default router;
