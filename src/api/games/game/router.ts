import { Router } from "express";
import {
  deleteGame,
  editGame,
  getAllGame,
  getDetailGame,
  postGame,
} from "./controller";
import { isLoginUser } from "../../../middleware/auth";
import { uploadSingle } from "../../../middleware/uploadImage";

const router = Router();

router.get("/", getAllGame);
router.get("/:id", isLoginUser, getDetailGame);
router.post("/", postGame);
// router.post("/", uploadSingle("gameImg"), postGame);
// router.put("/edit/:id", uploadSingle("gameImg"), editGame);
router.put("/edit/:id", editGame);
router.delete("/delete/:id", deleteGame);

export default router;
