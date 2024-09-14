import { Router } from "express";
import {
  // changeStatusUser,
  editUser,
  // getupdatedetailpolling,
  login,
  loginAgent,
  loginFormMpo,
  loginIntegrator,
  // loginWithGoogle,
  logout,
  register,
  registerAgent,
  // removeUser,
  // requestStream,
  // testMpo,
} from "./controller";
import { uploadSingle } from "../../../middleware/uploadImage";
import { isLoginUser } from "../../../middleware/auth";
// import { isLoginUser } from "../../../middleware/auth";

const router = Router();

// router.post("/loginGoogle", loginWithGoogle);
router.post("/login", login);
router.post("/login/agent", loginAgent);
router.post("/logins", loginFormMpo);
router.post("/login-integrator", loginIntegrator);
router.post("/logout", isLoginUser, logout);
router.post("/register", uploadSingle("profilePicture"), register);
router.post("/register/agent", uploadSingle("profilePicture"), registerAgent);
router.put("/edit", uploadSingle("profilePicture"), editUser);
// router.post("/update/:id", uploadSingle("profilePicture"), changeStatusUser);
// router.delete("/remove/:id", removeUser);
// router.post("/request", isLoginUser, requestStream);
// router.post("/testmp", testMpo);
// router.post("/testDetail", getupdatedetailpolling);
export default router;
