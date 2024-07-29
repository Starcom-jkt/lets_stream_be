import { Router } from "express";
import {
  changeStatusUser,
  login,
  logout,
  register,
  removeUser,
} from "./controller";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);
router.post("/update/:id", changeStatusUser);
router.delete("/remove/:id", removeUser);
export default router;
