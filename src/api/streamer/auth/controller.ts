import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../../../../db"; // Adjust the import according to your actual db configuration
import { ResultSetHeader } from "mysql2";

const JWT_SECRET = "your_secret_key_here"; // Replace with your actual secret key

const router = express.Router();

interface Agent {
  id: number;
  username: string;
  password: string;
}

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM agent WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid username or password" });
    }

    const agent = rows[0];
    const match = bcrypt.compareSync(password, agent.password);
    // const match = password === agent.password;
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid username or password" });
    }

    const description = "Logged in";
    const [login_session]: any = await pool.query(
      "INSERT INTO agent_login_log (userId, description) VALUES (?, ?)",
      [agent.id, description]
    );

    // Generate JWT token with agentData
    const token = jwt.sign({ agentData: agent }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      success: true,
      accessToken: token,
      message: "Logged in successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error during authentication", error });
  }
};

export const logout = async (req: Request, res: Response) => {
  // Verifikasi token dan dapatkan data agent
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "Agent ID not found in session" });
  }

  const description = "Logged out";
  await pool.query(
    "INSERT INTO agent_login_log (userId, description) VALUES (?, ?)",
    [userId, description]
  );

  const token = req.headers.authorization?.replace("Bearer ", "") ?? null;

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Token not provided" });
  }

  try {
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error logging out", error });
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, username, password, streamChannel } = req.body;
  const profilePicture = req.file?.filename || "default.png";
  const saltRounds = 10;
  const bcryptedPassword = await bcrypt.hash(password, saltRounds);

  try {
    // Check if the username or streamChannel already exists
    const [existingUsers]: any = await pool.query(
      "SELECT * FROM agent WHERE username = ? ",
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Username already exists",
      });
    }

    const [existingChannel]: any = await pool.query(
      "SELECT * FROM agent WHERE streamChannel = ?",
      [streamChannel]
    );

    if (existingChannel.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Stream Channel already exists",
      });
    }

    // Insert the new agent into the database
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO agent (name, username, profilePicture, password, streamChannel) VALUES (?, ?, ?, ?, ?)",
      [name, username, profilePicture, bcryptedPassword, streamChannel]
    );

    res.json({
      success: true,
      message: "Agent registered successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error during register", error });
  }
};

export const removeAgent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM agent WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Agent not found" });
    } else {
      res.json({ status: "success", message: "Agent deleted successfully" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: "false", message: "Error deleting Agent", error });
  }
};

export const changeStatusAgent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // First, get the current status of the agent
    const [rows]: [any[], any] = await pool.query(
      "SELECT status FROM agent WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === 0 ? 1 : 0;

    // Update the status of the agent
    const [result]: [ResultSetHeader, any] = await pool.query(
      "UPDATE agent SET status = ? WHERE id = ?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Agent not found" });
    } else {
      res.json({
        message: `Agent ${id} status updated successfully to ${newStatus}`,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating agent status", error });
  }
};
