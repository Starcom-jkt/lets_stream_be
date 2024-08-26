import { Router } from "express";
import {
  deleteActivity,
  editActivity,
  getAllActivities,
  getDetailActivity,
  postActivity,
} from "./controller";
import { uploadSingle } from "../../middleware/uploadImage";

const router = Router();

router.get("/", getAllActivities);
router.get("/:id", getDetailActivity);
router.post("/", uploadSingle("banner"), postActivity);
router.put("/edit/:id", editActivity);
router.delete("/delete/:id", deleteActivity);

export default router;
