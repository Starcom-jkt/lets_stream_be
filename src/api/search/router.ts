import { Router } from "express";
import { searchGame, searchGamebyGenre, searchStream } from "./controller";

const router = Router();

router.get("/stream", searchStream);
router.get("/game", searchGame);
router.get("/game/genre/:id", searchGamebyGenre);
export default router;
