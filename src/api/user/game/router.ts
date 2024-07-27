import { Router } from "express";
import {
  deleteGame,
  editGame,
  getAllGame,
  getDetailGame,
  postGame,
} from "./controller";

const router = Router();

router.get("/", getAllGame);
router.get("/:id", getDetailGame);
router.post("/", postGame);
router.put("/edit/:id", editGame);
router.delete("/delete/:id", deleteGame);

export default router;
