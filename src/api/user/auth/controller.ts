import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../../../../db"; // Adjust the import according to your actual db configuration
import { ResultSetHeader } from "mysql2";
import { google } from "googleapis";

// import { OAuth2Client } from "google-auth-library";

const CLIENT_ID =
  "1038226218211-ucf52g8l5stqaft5m05cmomblukfjvjt.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:3006/test";
const JWT_SECRET = "your_secret_key_here"; // Replace with your actual secret key

// const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

interface User {
  id: number;
  username: string;
  password: string;
  email: string;
}

export const loginWithGoogle = async (req: Request, res: Response) => {
  try {
    const code = req.body.code as string;

    if (!code) {
      return res.status(400).send("No code found");
    }

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: REDIRECT_URI, // Ensure this matches the one used to obtain the code
    });

    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2("v2");
    const userInfoResponse = await oauth2.userinfo.get({
      auth: oauth2Client,
    });

    const userInfo = userInfoResponse.data;
    if (!userInfo.email) {
      return res.status(400).send("Email not found in user info");
    }

    const user = {
      email: userInfo.email,
      username: userInfo.name,
      profilePicture: userInfo.picture,
      balance: 0,
      stream: 0,
      channelName: null,
      followers: 0,
      following: 0,
      status: 1,
    };

    // Check if user exists
    const [rows]: any = await pool.query("SELECT * FROM user WHERE email = ?", [
      userInfo.email,
    ]);

    if (rows.length === 0) {
      await pool.query(
        "INSERT INTO user (email, username, profilePicture, balance, stream, channelName, followers, following, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          user.email,
          user.username,
          user.profilePicture,
          user.balance,
          user.stream,
          user.channelName,
          user.followers,
          user.following,
          user.status,
        ]
      );
    }

    const token = jwt.sign({ userData: user }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ success: true, token, message: "Logged in successfully" });

    // Send response with user information
    console.log({ success: true, token, message: "Logged in successfully" });
  } catch (error) {
    console.error("Error during Google OAuth login:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, username, password, nickname } = req.body;
  const profilePicture = req.file?.filename || "default.png";
  const saltRounds = 10;
  const bcryptedPassword = await bcrypt.hash(password, saltRounds);
  const stream = 0;
  const channelName = null;
  const balance = 0;
  const followers = 0;
  const following = 0;
  const status = 1;

  try {
    // Check if the username or streamChannel already exists
    const [existingEmail]: any = await pool.query(
      "SELECT * FROM user WHERE email = ? ",
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Insert the new user into the database
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO user (email, username, profilePicture, password, stream, channelName, balance, followers, following, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        email,
        username,
        profilePicture,
        bcryptedPassword,
        stream,
        channelName,
        balance,
        followers,
        following,
        status,
      ]
    );

    res.json({
      success: true,
      data: {
        id: result.insertId,
        email,
        username,
        profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error during register", error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const [rows]: any = await pool.query("SELECT * FROM user WHERE email = ?", [
      email,
    ]);
    console.log(rows);
    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
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
      expiresIn: "1d",
    });

    res.json({ success: true, token, message: "Logged in successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error during authentication", error });
  }
};

export const logout = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace("Bearer ", "") ?? null;

  if (!token) {
    return res.status(400).json({ message: "not authorized" });
  }

  try {
    // await pool.query("INSERT INTO token_blacklist (token) VALUES (?)", [token]);
    // await pool.query ("INSERT INTO LOGIN_LOG (token, description) VALUES (?, ?)", [token, "Logged out"]);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out", error });
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
