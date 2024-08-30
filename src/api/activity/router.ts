import { Router } from "express";
import {
  deleteActivity,
  editActivity,
  getAllActivities,
  getDetailActivity,
  postActivity,
} from "./controller";
import { uploadMultiple, uploadSingle } from "../../middleware/uploadImage";

const fields = {
  poster: 1,
  banner: 1,
};

const router = Router();

router.get("/", getAllActivities);
router.get("/:id", getDetailActivity);
// router.post("/", uploadSingle("banner"), postActivity);
router.post("/", uploadMultiple(fields), postActivity);
router.put("/edit/:id", editActivity);
router.delete("/delete/:id", deleteActivity);

export default router;
