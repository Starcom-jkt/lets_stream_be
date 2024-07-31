import { Router } from "express";
import {
  changeStatusAgent,
  login,
  logout,
  register,
  removeAgent,
} from "./controller";
import { uploadSingle } from "../../../middleware/uploadImage";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", uploadSingle("profilePicture"), register);
router.post("/update/:id", changeStatusAgent);
router.delete("/remove/:id", removeAgent);

export default router;
