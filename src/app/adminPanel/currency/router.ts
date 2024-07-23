import { Router } from "express";
import {
  actionCreate,
  actionDelete,
  index,
  indexCreate,
  actionEdit,
  indexEdit,
} from "./controller";

const router = Router();

// Rute untuk menampilkan halaman currency
router.get("/", index);
router.get("/create", indexCreate);
router.post("/create", actionCreate);
router.delete("/delete/:id", actionDelete);
router.get("/edit/:id", indexEdit);
router.put("/edit/:id", actionEdit);

export default router;
