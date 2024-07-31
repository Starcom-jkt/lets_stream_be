import { Router } from "express";
import {
  deleteGame,
  editGame,
  getAllGame,
  getDetailGame,
  postGame,
} from "./controller";
import { isLoginViewer } from "../../../middleware/auth";
import { uploadSingle } from "../../../middleware/uploadImage";

const router = Router();

router.get("/", isLoginViewer, getAllGame);
router.get("/:id", getDetailGame);
router.post("/", uploadSingle("gameImg"), postGame);
router.put("/edit/:id", uploadSingle("gameImg"), editGame);
router.delete("/delete/:id", deleteGame);

export default router;
