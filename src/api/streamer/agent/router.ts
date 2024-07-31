import { Router } from "express";
import {
  deleteAgent,
  editAgent,
  getAllAgent,
  getDetailAgent,
  postAgent,
} from "./controller";
import { uploadSingle } from "../../../middleware/uploadImage";

const router = Router();

router.get("/", getAllAgent);
router.get("/:id", getDetailAgent);
router.post("/", uploadSingle("profilePicture"), postAgent);
router.put("/edit/:id", uploadSingle("profilePicture"), editAgent);
router.delete("/delete/:id", deleteAgent);

export default router;
