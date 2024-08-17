import { Request, Response } from "express";
import pool from "../../../db";
import { ResultSetHeader } from "mysql2";

export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const [data] = await pool.query(
      "SELECT * FROM notifications WHERE userId = ?",
      [userId]
    );
    res.json({ success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching notifications", error });
  }
};

export const getDetailNotifications = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [data] = await pool.query(
      "SELECT * FROM notifications WHERE id = ?",
      [id]
    );
    await pool.query("UPDATE notifications SET is_read = TRUE WHERE id = ?", [
      id,
    ]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error });
  }
};
