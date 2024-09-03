import { Router } from "express";
import {
  changeStatusUser,
  editUser,
  login,
  loginAgent,
  loginFormMpo,
  loginMpo,
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
router.post("/login/agent", loginAgent);
router.post("/loginGoogle", loginWithGoogle);
router.post("/loginMpo", loginMpo);
router.post("/loginFormMpo", loginFormMpo);
router.post("/logout", logout);
router.post("/register", uploadSingle("profilePicture"), register);
router.post("/register/agent", uploadSingle("profilePicture"), registerAgent);
router.post("/update/:id", uploadSingle("profilePicture"), changeStatusUser);
router.delete("/remove/:id", removeUser);
router.put("/edit", uploadSingle("profilePicture"), editUser);
router.post("/request", isLoginUser, requestStream);

export default router;
