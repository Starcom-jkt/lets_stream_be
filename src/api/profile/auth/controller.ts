import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../../../../db"; // Adjust the import according to your actual db configuration
import { FieldPacket, ResultSetHeader } from "mysql2";
import { google } from "googleapis";
require("dotenv").config();
import axios from "axios";
import https from "https";
import { getBalanceWebhook } from "../../../apiv2/testAccountBalance/controller";

// import { OAuth2Client } from "google-auth-library";
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const JWT_SECRET: string | undefined = process.env.JWT_SECRET;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

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

    const token = jwt.sign({ userData: user }, JWT_SECRET!, {
      expiresIn: "1d",
    });

    res.json({ success: true, token, message: "Logged in successfully" });

    // Send response with user information
  } catch (error) {
    console.error("Error during Google OAuth login:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  const profilePictures = [
    "avatardefault1.png",
    "avatardefault2.png",
    "avatardefault3.png",
    "avatardefault4.png",
    "avatardefault5.png",
    "avatardefault6.png",
    "avatardefault7.png",
    "avatardefault8.png",
    "avatardefault9.png",
  ];

  const profilePictureShuffle =
    profilePictures[Math.floor(Math.random() * profilePictures.length)];

  const profilePicture = req.file?.filename || profilePictureShuffle;

  const saltRounds = 10;
  const bcryptedPassword = await bcrypt.hash(password, saltRounds);

  try {
    // Check if the email already exists
    const [existingEmail]: any = await pool.query(
      "SELECT * FROM user WHERE email = ? ",
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Check if the username  already exists
    const [existingUsername]: any = await pool.query(
      "SELECT * FROM user WHERE username = ? ",
      [username]
    );

    const [existingChannelName]: any = await pool.query(
      "SELECT * FROM user WHERE channelName = ? ",
      [username]
    );

    if (existingUsername.length > 0 || existingChannelName.length > 0) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    // Insert the new user into the database
    await pool.query<ResultSetHeader>(
      "INSERT INTO user (email, username, profilePicture, password, channelName) VALUES (?, ?, ?, ?, ?)",
      [email, username, profilePicture, bcryptedPassword, username]
    );

    res.json({
      success: true,
      message: "Registered successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error during register", error });
  }
};

export const registerAgent = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  const profilePictures = [
    "avatardefault1.png",
    "avatardefault2.png",
    "avatardefault3.png",
    "avatardefault4.png",
    "avatardefault5.png",
    "avatardefault6.png",
    "avatardefault7.png",
    "avatardefault8.png",
    "avatardefault9.png",
  ];

  const profilePictureShuffle =
    profilePictures[Math.floor(Math.random() * profilePictures.length)];

  const profilePicture = req.file?.filename || profilePictureShuffle;
  const saltRounds = 10;
  const bcryptedPassword = await bcrypt.hash(password, saltRounds);

  try {
    // Check if the email already exists
    const [existingEmail]: any = await pool.query(
      "SELECT * FROM user WHERE email = ? ",
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Check if the username  already exists
    const [existingUsername]: any = await pool.query(
      "SELECT * FROM user WHERE username = ? ",
      [username]
    );

    const [existingChannelName]: any = await pool.query(
      "SELECT * FROM user WHERE channelName = ? ",
      [username]
    );

    if (existingUsername.length > 0 || existingChannelName.length > 0) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    const stream = 1;
    const channelName = username;

    // Insert the new user into the database
    await pool.query<ResultSetHeader>(
      "INSERT INTO user (email, username, profilePicture, password, stream, channelName) VALUES (?, ?, ?, ?, ?, ?)",
      [email, username, profilePicture, bcryptedPassword, stream, channelName]
    );

    res.json({
      success: true,
      message: "Registered successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error during register", error });
  }
};

export const editUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }

  if (updates.password) {
    const saltRounds = 10;
    updates.password = await bcrypt.hash(updates.password, saltRounds);
  }

  const fields = Object.keys(updates);
  const values = Object.values(updates);

  // Buat query dinamis
  const setClause = fields.map((field) => `${field} = ?`).join(", ");

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE user SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "User not found" });
    } else {
      // Return the updated user data, excluding the hashed password
      const updatedUser: Record<string, any> = {}; // Menggunakan Record untuk tipe dinamis
      fields.forEach((field, index) => {
        if (field !== "password") {
          updatedUser[field] = values[index];
        }
      });

      res.json({
        success: true,
        data: { id, ...updatedUser },
        message: "User updated successfully",
      });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user", error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const [rows]: any = await pool.query("SELECT * FROM user WHERE email = ?", [
      email,
    ]);
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

    await pool.query<ResultSetHeader>(
      "UPDATE user SET online = 1 WHERE id = ?",
      [user.id]
    );

    // Generate JWT token with userData
    const token = jwt.sign({ userData: user }, JWT_SECRET!, {
      expiresIn: "1d",
    });

    res.json({ success: true, token, message: "Logged in successfully" });
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).json({ message: "Error during authentication", error });
  }
};

export const loginAgent = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const [rows]: any = await pool.query("SELECT * FROM user WHERE email = ?", [
      email,
    ]);

    const user = rows[0];
    if (user.stream === true || user.stream === 1) {
      if (user.length === 0) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }

      const match = bcrypt.compareSync(password, user.password);
      if (!match) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid username or password" });
      }

      await pool.query<ResultSetHeader>(
        "UPDATE user SET online = 1 WHERE id = ?",
        [user.id]
      );

      // Generate JWT token with userData
      const token = jwt.sign({ userData: user }, JWT_SECRET!, {
        expiresIn: "1d",
      });

      res.json({ success: true, token, message: "Logged in successfully" });
    } else {
      res
        .status(401)
        .json({ success: false, message: "You dont have permission" });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).json({ message: "Error during authentication", error });
  }
};

export const logout = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  // Cek jika userId tersedia
  if (!userId) {
    return res.status(400).json({ message: "User ID not found" });
  }

  try {
    // Update status online user menjadi 0 (offline)
    const [result]: any = await pool.query(
      "UPDATE user SET online = 0 WHERE id = ?",
      [userId]
    );

    // Cek jika update berhasil
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to update online status, user not found",
      });
    }

    const token = req.headers.authorization?.replace("Bearer ", "") ?? null;

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await pool.query(
      "INSERT INTO token_blacklist (token, user_id) VALUES (?, ?)",
      [token, userId]
    );

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res
      .status(500)
      .json({ success: false, message: "Error during logging out", error });
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

export const requestStream = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID not found" });
    }

    // Cek apakah user sudah pernah melakukan request
    const [existingRequest] = await pool.query<ResultSetHeader[]>(
      "SELECT * FROM request_stream WHERE userId = ?",
      [userId]
    );

    if (existingRequest.length > 0) {
      // Jika sudah ada request, kembalikan respons bahwa user tidak bisa request lagi
      return res.status(400).json({
        success: false,
        message:
          "Your request is being processed. Please wait for the confirmation.",
      });
    }

    await pool.query<ResultSetHeader>(
      "INSERT INTO request_stream (userId) VALUES (?)",
      [userId]
    );
    res.json({
      success: true,
      message: "Your request has been sent",
    });
  } catch (error) {
    res.status(500).json({ message: "Error requesting stream", error });
  }
};

export const loginFormMpo = async (req: Request, res: Response) => {
  const { username, player_id } = req.body;
  // Check if username or player_id is missing
  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Need username",
    });
  }

  if (!player_id) {
    return res.status(400).json({
      success: false,
      message: "Need player_id",
    });
  }

  try {
    // Periksa apakah username atau player_id sudah ada di database
    const [userCheck]: [any[], FieldPacket[]] = await pool.query(
      "SELECT * FROM user WHERE username = ? OR player_id = ?",
      [username, player_id]
    );

    let user;
    if (userCheck.length > 0) {
      // Jika username dan player_id keduanya cocok, lakukan login
      user = userCheck.find(
        (user) => user.username === username && user.player_id === player_id
      );

      if (!user) {
        // Jika username sudah ada tetapi player_id berbeda
        const existingUsername = userCheck.find(
          (user) => user.username === username
        );
        if (existingUsername) {
          return res.status(400).json({
            success: false,
            message: "Username doesn't match with player_id",
          });
        }

        // Jika player_id sudah ada tetapi username berbeda
        const existingPlayerId = userCheck.find(
          (user) => user.player_id === player_id
        );
        if (existingPlayerId) {
          return res.status(400).json({
            success: false,
            message: "Player_id doesn't match with username",
          });
        }
      }
    } else {
      // Jika tidak ada konflik, daftarkan pengguna baru
      const email = `${username}@gmail.com`;
      const channelName = username;

      const profilePictures = [
        "avatardefault1.png",
        "avatardefault2.png",
        "avatardefault3.png",
        "avatardefault4.png",
        "avatardefault5.png",
        "avatardefault6.png",
        "avatardefault7.png",
        "avatardefault8.png",
        "avatardefault9.png",
      ];

      const profilePicture =
        profilePictures[Math.floor(Math.random() * profilePictures.length)];

      // Dapatkan balance terbaru dari service eksternal
      const agent = new https.Agent({
        rejectUnauthorized: false, // Ignoring SSL verification for testing purposes
      });

      // const balanceResponse = await axios.post(
      //   "http://localhost:3006/api/v1/str/balance",
      //   {
      //     player_id: player_id,
      //   },
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );
      const balanceResponse = await axios.post(
        "https://str-stg.mixcdn.link/str/balance",
        {
          play_id: player_id,
        },
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiY2hyaXMifQ.JBvFJ1OPCkb4l69zUJTwNzpbFjQeZ0FEmaSBn6VLb00`,
            "Content-Type": "application/json",
          },
          httpsAgent: agent,
          timeout: 20000,
        }
      );

      if (balanceResponse.status !== 200) {
        return res.status(500).json({
          success: false,
          message: "Failed to fetch balance",
        });
      }

      const balance = parseFloat(balanceResponse.data.data.toFixed(6));

      // Insert user baru ke database
      const [result]: [ResultSetHeader, FieldPacket[]] = await pool.query(
        "INSERT INTO user (email, username, player_id, profilePicture, channelName, balance) VALUES (?, ?, ?, ?, ?, ?)",
        [email, username, player_id, profilePicture, channelName, balance]
      );

      if (result.affectedRows === 0) {
        return res
          .status(500)
          .json({ success: false, message: "Registration failed" });
      }

      // Ambil data pengguna yang baru saja didaftarkan
      const [newUserRows]: [any[], FieldPacket[]] = await pool.query(
        "SELECT * FROM user WHERE id = ?",
        [result.insertId]
      );

      user = newUserRows[0];

      await pool.query("UPDATE user SET online = 1 WHERE id = ?", [user.id]);

      // Generate JWT token with user data
      const token = jwt.sign({ userData: user }, JWT_SECRET!, {
        expiresIn: "1d",
      });

      return res.json({
        success: true,
        message: "Registration successful",
        token,
        balance,
      });
    }

    // Update balance jika user sudah terdaftar
    const agent = new https.Agent({
      rejectUnauthorized: false, // Ignoring SSL verification for testing purposes
    });

    const balanceResponse = await axios.post(
      "https://str-stg.mixcdn.link/str/balance",
      {
        play_id: player_id,
      },
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiY2hyaXMifQ.JBvFJ1OPCkb4l69zUJTwNzpbFjQeZ0FEmaSBn6VLb00`,
          "Content-Type": "application/json",
        },
        httpsAgent: agent,
        timeout: 20000,
      }

      // "http:localhost:3006/api/v1/str/balance",
      // {
      //   player_id: player_id,
      // }
    );
    // console.log("Balance API Response:", balanceResponse);

    if (balanceResponse.status !== 200) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch balance",
      });
    }

    const balance = parseFloat(balanceResponse.data.data.toFixed(6));

    // Perbarui balance di database
    const [updateResult]: [ResultSetHeader, FieldPacket[]] = await pool.query(
      "UPDATE user SET balance = ? WHERE player_id = ?",
      [balance, player_id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to update balance in the database",
      });
    }

    await pool.query("UPDATE user SET online = 1 WHERE id = ?", [user.id]);

    // Generate JWT token dengan userData
    const token = jwt.sign({ userData: user }, JWT_SECRET!, {
      expiresIn: "1d",
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      balance,
    });
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).json({ message: "Error during authentication", error });
  }
};

export const testMpo = async (req: Request, res: Response) => {
  try {
    const agent = new https.Agent({
      rejectUnauthorized: false, // Ignoring SSL verification for testing purposes
    });

    const response = await axios.post(
      "https://str-stg.mixcdn.link/str/balance",
      {
        play_id: "8dxw86xw6u027",
      },
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiY2hyaXMifQ.JBvFJ1OPCkb4l69zUJTwNzpbFjQeZ0FEmaSBn6VLb00`,
          "Content-Type": "application/json",
        },
        httpsAgent: agent,
        timeout: 20000, // Increased timeout
      }
    );

    res.status(200).json(response.data);
  } catch (error: any) {
    if (error.response) {
      console.log("Response data:", error.response.data);
      console.log("Response status:", error.response.status);
      console.log("Response headers:", error.response.headers);
    } else if (error.request) {
      console.log("No response received:", error.request);
    } else {
      console.log("Error", error.message);
    }
    console.log("Error config:", error.config);

    res.status(500).json({ message: "Error fetching balance", error });
  }
};
