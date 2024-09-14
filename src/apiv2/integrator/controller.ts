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
import bcrypt from "bcrypt";

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

// Fungsi untuk membuat player_id
function generatePlayerId(): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let player_id = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    player_id += characters[randomIndex];
  }
  return player_id;
}

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;

    // Validasi input
    if (!username || !password || !email) {
      return res.status(400).json({
        message: "All fields (username, password, email) are required",
      });
    }

    // Cek apakah email sudah terdaftar
    const [existingUser] = await pool.query<ResultSetHeader[]>(
      `SELECT id FROM userTest WHERE email = ?`,
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate player_id
    const player_id = generatePlayerId();

    // Simpan user ke database
    const [result]: [ResultSetHeader, any] = await pool.query(
      `INSERT INTO userTest (username, player_id, password, email) VALUES (?, ?, ?, ?)`,
      [username, player_id, hashedPassword, email]
    );

    // Pastikan user berhasil disimpan
    if (result.affectedRows === 1) {
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        player_id,
      });
    } else {
      res.status(500).json({ message: "Failed to register user" });
    }
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Error during registration", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required" });
    }

    // Cek apakah email ada di database
    const [rows]: any = await pool.query(
      `SELECT * FROM userTest WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    // Cek apakah password valid dengan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token setelah login berhasil
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        player_id: user.player_id,
      },
      process.env.JWT_SECRET!, // Pastikan JWT_SECRET diatur di environment variables
      {
        expiresIn: "1d", // Token berlaku selama 1 hari
      }
    );

    // Return token dan pesan sukses
    res.json({
      success: true,
      message: "Logged in successfully",
      token,
    });
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
      "https://2shop.codes/api/v1/str/balance",
      { player_id: player_id },
      {
        timeout: 20000, // Timeout for the API request
      }
    );
    // const agent = new https.Agent({
    //   rejectUnauthorized: false, // Ignoring SSL verification for testing purposes
    // });
    // const balanceResponse = await axios.post(
    //   "https://str-stg.mixcdn.link/str/balance",
    //   {
    //     play_id: player_id,
    //   },
    //   {
    //     headers: {
    //       Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiY2hyaXMifQ.JBvFJ1OPCkb4l69zUJTwNzpbFjQeZ0FEmaSBn6VLb00`,
    //       "Content-Type": "application/json",
    //     },
    //     httpsAgent: agent,
    //     timeout: 20000,
    //   }
    // );
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

export const fetchDeductBalanceGift = async (
  player_id: string,
  amount: number,
  gift: string,
  streamer: string,
  req: Request,
  res: Response
) => {
  try {
    // Deduct balance from external service
    const deductResponse = await axios.post(
      "https://2shop.codes/api/v1/str/deduct",
      { player_id, amount, gift, streamer },
      {
        timeout: 20000, // Timeout for the API request
      }
    );

    // Check if the deduction was successful
    if (deductResponse.data && deductResponse.data.status === "success") {
      // Get updated balance from external service
      const balanceResponse = await axios.post(
        "https://2shop.codes/api/v1/str/balance",
        { player_id: player_id },
        {
          timeout: 20000, // Timeout for the API request
        }
      );

      // Extract the balance from the response
      const updatedBalance = balanceResponse.data.balance;

      // Update the balance in the database
      const [result]: any = await pool.query(
        `UPDATE user SET balance = ? WHERE player_id = ?`,
        [updatedBalance, player_id]
      );

      // Send success response with updated data
      res
        .status(200)
        .json({ message: "Balance updated successfully", data: result });
    } else {
      // Handle the case where deduction failed
      res.status(400).json({ message: "Failed to deduct balance" });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Error during balance update process" });
  }
};

export const addBalance = async (req: Request, res: Response) => {
  try {
    const { player_id, amount } = req.body;
    const [result]: any = await pool.query(
      `UPDATE userTest SET balance = balance + ? WHERE player_id = ?`,
      [amount, player_id]
    );
    res.status(200).json({ message: "success", data: result });
  } catch (error) {
    res.status(500).json({ message: "error during update user test" });
  }
};
