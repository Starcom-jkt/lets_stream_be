import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../../../db";

import session from "express-session";

interface CustomSession extends session.Session {
  user?: { id: number; email: string; status: string; name: string };
}

const jwtSecretKey = "your_secret_key_here"; // Gantilah dengan kunci rahasia Anda

export const isLoginAdmin = (
  req: Request & { session: CustomSession },
  res: Response,
  next: NextFunction
) => {
  if (!req.session.user) {
    req.flash(
      "alertMessage",
      "Mohon maaf session anda telah habis silahkan login kembali"
    );
    req.flash("alertStatus", "danger");
    return res.redirect("/admin/login");
  } else {
    next();
  }
};

export const isLoginViewer = async (
  req: Request & { session: CustomSession },
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "") ?? null;

    if (!token) {
      throw new Error("Token not provided");
    }

    const data: any = jwt.verify(token, jwtSecretKey);

    const [result] = await pool.execute("SELECT * FROM players WHERE id =?", [
      data.player.id,
    ]);

    const rows = result as any[];

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("Player not found");
    }

    req.body.player = rows[0];
    req.body.token = token;
    next();
  } catch (err) {
    res.status(401).json({
      error: "Not authorized to access this resource",
    });
  }
};
