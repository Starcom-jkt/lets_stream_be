import { Router } from "express";
import {
  filterByDate,
  filterByDatebyUserId,
  filterIn,
  filterOut,
  filterInById,
  filterOutById,
  getUserTransactions,
  getUserTransactionsByUserId,
} from "./controller";
import { isLoginUser } from "../../../middleware/auth";

const router = Router();

router.get("/", isLoginUser, getUserTransactions); //done
router.get("/date", isLoginUser, filterByDate); // done
router.get("/in", isLoginUser, filterIn); // done
router.get("/out", isLoginUser, filterOut); // done
// by id
router.get("/:id", getUserTransactionsByUserId); // done
router.get("/date/:id", filterByDatebyUserId); // done
router.get("/in/:id", filterInById); // done
router.get("/out/:id", filterOutById); // done
export default router;
