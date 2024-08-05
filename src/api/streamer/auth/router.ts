import { Router } from "express";
import {
  changeStatusAgent,
  login,
  logout,
  register,
  removeAgent,
} from "./controller";
import { uploadSingle } from "../../../middleware/uploadImage";
import { isLoginAgent } from "../../../middleware/auth";

const router = Router();

router.post("/login", login);
router.post("/logout", isLoginAgent, logout);
router.post("/register", uploadSingle("profilePicture"), register);
router.post("/update/:id", changeStatusAgent);
router.delete("/remove/:id", removeAgent);

export default router;
