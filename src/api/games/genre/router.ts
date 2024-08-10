import { Router } from "express";
import {
  deleteGenre,
  editGenre,
  getAllGenre,
  getDetailGenre,
  postGenre,
} from "./controller";

const router = Router();

router.get("/", getAllGenre);
router.get("/:id", getDetailGenre);
router.post("/", postGenre);
router.put("/edit/:id", editGenre);
router.delete("/delete/:id", deleteGenre);

export default router;
