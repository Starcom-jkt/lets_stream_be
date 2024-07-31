import { Router } from "express";
import {
  deletemerchant,
  editmerchant,
  getAllMerchant,
  getDetailmerchant,
  postmerchant,
} from "./controller";
import { isLoginViewer } from "../../../middleware/auth";
import { uploadSingle } from "../../../middleware/uploadImage";

const router = Router();

router.get("/", isLoginViewer, getAllMerchant);
router.get("/:id", getDetailmerchant);
router.post("/", uploadSingle("merchantLogo"), postmerchant);
router.put("/edit/:id", uploadSingle("merchantLogo"), editmerchant);
router.delete("/delete/:id", deletemerchant);

export default router;
