import { Router } from "express";
import { editUser, getDetail } from "./controller";
import { uploadSingle } from "../../../middleware/uploadImage";
import { isLoginUser } from "../../../middleware/auth";

const router = Router();

router.put("/edit", isLoginUser, uploadSingle("profilePicture"), editUser);
router.get("/detail", isLoginUser, getDetail);
export default router;
