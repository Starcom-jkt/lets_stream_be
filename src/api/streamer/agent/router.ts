import { Router } from "express";
import {
  deleteAgent,
  editAgent,
  getAllAgent,
  getDetailAgent,
  postAgent,
} from "./controller";

const router = Router();

router.get("/", getAllAgent);
router.get("/:id", getDetailAgent);
router.post("/", postAgent);
router.put("/edit/:id", editAgent);
router.delete("/delete/:id", deleteAgent);

export default router;
