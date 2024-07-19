import { Router } from "express";
import {
  deleteGift,
  editGift,
  getAllGifts,
  getDetailGift,
  postGift,
} from "./controller";

const router = Router();

router.get("/", getAllGifts);
router.get("/:id", getDetailGift);
router.post("/", postGift);
router.put("/edit/:id", editGift);
router.delete("/delete/:id", deleteGift);

export default router;
