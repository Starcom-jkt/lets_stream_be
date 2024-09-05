import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import pool from "../../../db"; // Sesuaikan dengan konfigurasi db Anda
import { ResultSetHeader } from "mysql2";
require("dotenv").config();
import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import express from "express";
import axios from "axios";
import https from "https";

// Setup Express dan HTTP Server
const app = express();
const httpServer = new HttpServer(app);

// Setup Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
  },
});

export const getBalance = async (req: Request, res: Response) => {
  try {
    const player_id = req.body.player_id;

    // Query to get the balance from the database
    const [result]: any = await pool.query(
      `SELECT balance FROM userTest WHERE player_id = ?`,
      [player_id]
    );

    if (result.length > 0) {
      // Get the balance and format it
      const balance = parseFloat(Number(result[0].balance).toFixed(6));

      // Return the formatted payload
      res.json({
        success: true,
        code: 200,
        data: balance,
        error: null,
      });
    } else {
      res.status(404).json({
        success: false,
        code: 404,
        data: null,
        error: "User not found",
      });
    }
  } catch (error) {
    console.error("Error getting user balance:", error);

    // Return the error payload
    res.status(500).json({
      success: false,
      code: 500,
      data: null,
      error: "Error getting user balance",
    });
  }
};

export const getBalanceWebhook = async (req: Request, res: Response) => {
  try {
    // Ambil player_id dari request body (dikirim oleh webhook)
    const { player_id } = req.body;

    if (!player_id) {
      return res
        .status(400)
        .json({ success: false, message: "player_id is required" });
    }

    // Query untuk mendapatkan balance berdasarkan player_id
    const [result]: any = await pool.query(
      `SELECT balance FROM userTest WHERE player_id = ?`,
      [player_id]
    );

    if (result.length > 0) {
      const balance = parseFloat(Number(result[0].balance).toFixed(6));

      // Kirim respons JSON dengan balance
      res.json({
        success: true,
        balance,
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error getting user balance:", error);
    res
      .status(500)
      .json({ success: false, message: "Error getting user balance", error });
  }
};

export const deductBalance = async (req: Request, res: Response) => {
  try {
    const { player_id, amount, gift, streamer } = req.body;

    if (!player_id) {
      return res.status(400).json({ message: "player_id is required" });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const [result]: any = await pool.query(
      `SELECT balance FROM userTest WHERE player_id = ?`,
      [player_id]
    );

    if (result.length > 0) {
      const currentBalance = parseFloat(result[0].balance);

      if (currentBalance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const newBalance = currentBalance - amount;

      const [updateResult]: [ResultSetHeader, any] = await pool.query(
        `UPDATE userTest SET balance = ? WHERE player_id = ?`,
        [newBalance.toFixed(6), player_id]
      );

      if (updateResult.affectedRows > 0) {
        const data = {
          player_id,
          credit_before: parseFloat(currentBalance.toFixed(2)),
          credit_after: parseFloat(newBalance.toFixed(2)),
          amount_deducted: parseFloat(amount.toFixed(2)),
          gift,
          streamer,
        };

        res.json({
          success: true,
          data: data,
          message: "Balance deducted successfully",
        });
      } else {
        res.status(500).json({ message: "Failed to update balance" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error deducting balance:", error);
    res.status(500).json({ message: "Error deducting balance", error });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, player_id, balance } = req.body;

    if (!username || !player_id) {
      return res
        .status(400)
        .json({ message: "Username and Player ID are required" });
    }

    const [result]: [ResultSetHeader, any] = await pool.query(
      `INSERT INTO userTest (username, player_id, balance) VALUES (?, ?, ?)`,
      [username, player_id, balance || 0.0]
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Error during registration", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, player_id } = req.body;

    if (!username || !player_id) {
      return res
        .status(400)
        .json({ message: "Username and Player ID are required" });
    }

    const [rows]: any = await pool.query(
      `SELECT * FROM userTest WHERE username = ? AND player_id = ?`,
      [username, player_id]
    );

    if (rows.length > 0) {
      const user = rows[0];

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET!,
        {
          expiresIn: "1d",
        }
      );

      res.json({
        success: true,
        message: "Logged in successfully",
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid username or player ID" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Error during login", error });
  }
};

export const getAllUser = async (req: Request, res: Response) => {
  try {
    const data = await pool.query("SELECT * FROM userTest");
    res.status(200).json({ message: "success", data });
  } catch (error) {
    res.status(500).json({ message: "error during get all user test" });
  }
};

export const updateBalance = async (req: Request, res: Response) => {
  try {
    const { player_id, balance } = req.body;
    const [result]: any = await pool.query(
      `UPDATE userTest SET balance = ? WHERE player_id = ?`,
      [balance, player_id]
    );
    res.status(200).json({ message: "success", data: result });
  } catch (error) {
    res.status(500).json({ message: "error during update user test" });
  }
};

// Fungsi untuk fetch balance dari API
export const fetchBalance = async (player_id: string) => {
  try {
    const balanceResponse = await axios.post(
      "http://localhost:3006/api/v1/str/balance",
      { player_id: "qwerty" },
      {
        timeout: 20000, // Timeout for the API request
      }
    );

    if (balanceResponse.status === 200) {
      return parseFloat(balanceResponse.data.data.toFixed(6));
    } else {
      throw new Error("Failed to fetch balance");
    }
  } catch (error) {
    console.error("Error fetching balance from API:", error);
    throw error;
  }
};
