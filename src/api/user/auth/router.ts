import { Router } from "express";
import {
  changeStatusUser,
  login,
  logout,
  register,
  removeUser,
} from "./controller";
import { uploadSingle } from "../../../middleware/uploadImage";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", uploadSingle("profilePicture"), register);
router.post("/update/:id", uploadSingle("profilePicture"), changeStatusUser);
router.delete("/remove/:id", removeUser);
export default router;
