import { Router } from "express";
import {
  changeStatusUser,
  editUser,
  login,
  loginWithGoogle,
  logout,
  register,
  registerAgent,
  removeUser,
  requestStream,
} from "./controller";
import { uploadSingle } from "../../../middleware/uploadImage";
import { isLoginUser } from "../../../middleware/auth";

const router = Router();

router.post("/login", login);
router.post("/loginGoogle", loginWithGoogle);
router.post("/logout", logout);
router.post("/register", uploadSingle("profilePicture"), register);
router.post("/register/agent", uploadSingle("profilePicture"), registerAgent);
router.post("/update/:id", uploadSingle("profilePicture"), changeStatusUser);
router.delete("/remove/:id", removeUser);
router.put("/edit/:id", uploadSingle("profilePicture"), editUser);
router.post("/request", isLoginUser, requestStream);

export default router;
