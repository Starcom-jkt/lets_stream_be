import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../../../../db"; // Adjust the import according to your actual db configuration
import { ResultSetHeader } from "mysql2";

const JWT_SECRET = "your_secret_key_here"; // Replace with your actual secret key

const generateUniqueKey = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

interface User {
  id: number;
  username: string;
  password: string;
}

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM user WHERE username = ?",
      [username]
    );
    console.log(rows);
    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    const user = rows[0];
    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    // Generate JWT token with userData
    const token = jwt.sign({ userData: user }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ success: true, token, message: "Logged in successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error during authentication", error });
  }
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

export const register = async (req: Request, res: Response) => {
  const { email, username, profilePicture, password, nickname, streamChannel } =
    req.body;
  const playerId = generateUniqueKey();
  const saltRounds = 10;
  const bcryptedPassword = await bcrypt.hash(password, saltRounds);

  try {
    // Check if the username or streamChannel already exists
    const [existingEmail]: any = await pool.query(
      "SELECT * FROM user WHERE email = ? ",
      [username]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const [existingNickname]: any = await pool.query(
      "SELECT * FROM user WHERE nickname = ?",
      [nickname]
    );

    if (existingNickname.length > 0) {
      return res.status(400).json({
        message: "Nickname Channel already exists",
      });
    }

    // Insert the new user into the database
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO user (email, username, profilePicture, password, playerId) VALUES (?, ?, ?, ?, ?)",
      [email, username, profilePicture, bcryptedPassword, playerId]
    );

    res.json({
      id: result.insertId,
      email,
      username,
      profilePicture,
      bcryptedPassword,
      playerId,
    });
  } catch (error) {
    res.status(500).json({ message: "Error during register", error });
  }
};

export const removeUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM user WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "user not found" });
    } else {
      res.json({ message: "user deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

export const changeStatusUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // First, get the current status of the user
    const [rows]: [any[], any] = await pool.query(
      "SELECT status FROM user WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "user not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === 0 ? 1 : 0;

    // Update the status of the user
    const [result]: [ResultSetHeader, any] = await pool.query(
      "UPDATE user SET status = ? WHERE id = ?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "user not found" });
    } else {
      res.json({
        message: `user ${id} status updated successfully to ${newStatus}`,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating user status", error });
  }
};
