import { Router } from "express";
import {
  deletemerchant,
  editmerchant,
  getAllMerchant,
  getDetailmerchant,
  postmerchant,
} from "./controller";

const router = Router();

router.get("/", getAllMerchant);
router.get("/:id", getDetailmerchant);
router.post("/", postmerchant);
router.put("/edit/:id", editmerchant);
router.delete("/delete/:id", deletemerchant);

export default router;
