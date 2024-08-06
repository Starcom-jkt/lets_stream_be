import { Router } from "express";
import {
  deleteGift,
  editGift,
  getAllGifts,
  getDetailGift,
  postGift,
} from "./controller";
import { isLoginUser } from "../../../middleware/auth";
import { uploadSingle } from "../../../middleware/uploadImage";

const router = Router();

router.get("/", getAllGifts);
router.get("/:id", getDetailGift);
router.post("/", uploadSingle("img"), isLoginUser, postGift);
router.put("/edit/:id", uploadSingle("img"), isLoginUser, editGift);
router.delete("/delete/:id", isLoginUser, deleteGift);

export default router;
