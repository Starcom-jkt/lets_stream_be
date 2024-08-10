import { Router } from "express";
import { access_token } from "./controller";

const router = Router();

router.post("/access_token", access_token);
export default router;
