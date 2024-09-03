import { Request, Response } from "express";
import pool from "../../../db";
import { ResultSetHeader } from "mysql2";
import https from "https";
import axios from "axios";

export const testDeductBalance = async (req: Request, res: Response) => {
  try {
    const agent = new https.Agent({
      rejectUnauthorized: false, // Ignore SSL certificate errors
    });

    const data = {
      play_id: "8dxw86xw6u027",
      bet_id: "asasdsdafsddcsadd",
      amount: 100,
      gift: "giftDetails.giftName", // Make sure this is a valid string
      streamer: "recipientUser.username", // Make sure this is a valid string
      bet_time: "2024-09-02 11:57:21",
    };

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiY2hyaXMifQ.JBvFJ1OPCkb4l69zUJTwNzpbFjQeZ0FEmaSBn6VLb00`,
      },
      httpsAgent: agent,
    };

    try {
      const response = await axios.post(
        `https://str-stg.mixcdn.link/str/deduct`,
        data,
        config
      );
      res.status(200).json({
        success: true,
        message: "Balance deducted successfully",
        data: response.data,
      });
    } catch (error: any) {
      console.error("Error during axios request:", error.message || error);
      res.status(500).json({
        success: false,
        message: "Failed to deduct balance",
        error: error.message || error,
      });
    }
  } catch (error: any) {
    console.error("Unexpected error:", error.message || error);
    res.status(500).json({
      success: false,
      message: "Unexpected error occurred",
      error: error.message || error,
    });
  }
};

export const getAllGifts = async (req: Request, res: Response) => {
  try {
    const [data] = await pool.query("SELECT * FROM gift");
    res.json({ success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching gifts", error });
  }
};

export const getDetailGift = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [data] = await pool.query("SELECT * FROM gift where id = ?", [id]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching gifts", error });
  }
};

export const postGift = async (req: Request, res: Response) => {
  const { giftName, giftLink, price } = req.body;
  const img = req.file?.filename || "";
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO gift (img, giftName, giftLink, price) VALUES (?, ?, ?, ?)",
      [img, giftName, giftLink, price]
    );
    res.json({
      success: true,
      id: result.insertId,
      img,
      giftName,
      giftLink,
      price,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding gift", error });
  }
};

export const editGift = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  // Buat query dinamis
  const setClause = fields.map((field) => `${field} = ?`).join(", ");

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE gift SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Gift not found" });
    } else {
      res.json({ id, ...updates });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating gift", error });
  }
};

export const deleteGift = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM gift WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Gift not found" });
    } else {
      res.json({ message: "Gift deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting gift", error });
  }
};
