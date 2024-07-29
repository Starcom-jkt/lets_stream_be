import { Router } from "express";
import {
  changeStatusAgent,
  login,
  logout,
  register,
  removeAgent,
} from "./controller";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);
router.post("/update/:id", changeStatusAgent);
router.delete("/remove/:id", removeAgent);

export default router;
