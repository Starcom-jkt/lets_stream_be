import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import session from "express-session";
import pool from "../../db";

interface CustomSession extends session.Session {
  user?: { id: number; email: string; status: string; name: string };
}

const JWT_SECRET = "your_secret_key_here"; // Gantilah dengan kunci rahasia Anda

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
    return res.redirect("/admin/auth");
  } else {
    next();
  }
};

interface CustomRequest extends Request {
  agent?: { agentId?: any };
  user?: { userId?: any };
}

export const isLoginAgent = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "") ?? null;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }

      req.agent = decoded.agentData; // Ensure this contains valid token type
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Error processing authentication", error });
  }
};

export const isLoginUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "") ?? null;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Cek apakah token ada di dalam blacklist di database
    const [blacklistedToken]: any = await pool.query(
      "SELECT * FROM token_blacklist WHERE token = ?",
      [token]
    );

    if (blacklistedToken.length > 0) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }

      req.user = decoded.userData; // Ensure this contains valid token type
      // console.log("req.user", req.user);
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Error processing authentication", error });
  }
};
