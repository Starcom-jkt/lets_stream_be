import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../../../db";
import config from "../../config";

interface JwtPayload {
  player: {
    id: number;
  };
}

export const isLoginAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session.user) {
    req.flash(
      "alertMessage",
      "Mohon maaf session anda telah habis silahkan login kembali"
    );
    req.flash("alertStatus", "danger");
    return res.redirect("/");
  } else {
    next();
  }
};

export const isLoginPlayer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization
      ? req.headers.authorization.replace("Bearer ", "")
      : null;

    if (!token) {
      throw new Error("Token not provided");
    }

    const data = jwt.verify(token, config.jwtKey) as JwtPayload;

    const [rows] = await pool.query("SELECT * FROM players WHERE id = ?", [
      data.player.id,
    ]);

    if ((rows as any).length === 0) {
      throw new Error("Player not found");
    }

    req.body.player = (rows as any)[0];
    req.body.token = token;
    next();
  } catch (err) {
    res.status(401).json({
      error: "Not authorized to access this resource",
    });
  }
};
