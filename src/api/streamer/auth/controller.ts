import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../../../../db"; // Adjust the import according to your actual db configuration

const JWT_SECRET = "your_jwt_secret_key"; // Replace with your actual secret key

const router = express.Router();

interface Agent {
  id: number;
  username: string;
  password: string;
}

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const [rows]: any = await pool.query(
    "SELECT * FROM agent WHERE username = ?",
    [username]
  );
  if (rows.length === 0) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  const agent: Agent = rows[0];
  //   const match = await bcrypt.compare(password, agent.password);
  const match = password === agent.password;
  if (!match) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  const token = jwt.sign({ agent: { id: agent.id } }, JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace("Bearer ", "") ?? null;

  if (!token) {
    return res.status(400).json({ message: "Token not provided" });
  }

  try {
    await pool.query("INSERT INTO token_blacklist (token) VALUES (?)", [token]);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out", error });
  }
};
