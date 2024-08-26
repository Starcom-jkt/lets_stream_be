import { Request, Response } from "express";
import pool from "../../../db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const getAllActivities = async (req: Request, res: Response) => {
  try {
    // Ambil semua data activity
    const [activities]: [RowDataPacket[], any] = await pool.query(
      "SELECT * FROM activity"
    );

    res.json({ success: true, data: activities });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching activities", error });
  }
};

export const getDetailActivity = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [data]: [RowDataPacket[], any] = await pool.query(
      "SELECT * FROM activity WHERE id = ?",
      [id]
    );
    if (data.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching activity details",
        error,
      });
  }
};

export const postActivity = async (req: Request, res: Response) => {
  const { poster, banner, title } = req.body;
  if (!poster || !banner || !title) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const [result]: [ResultSetHeader, any] = await pool.query<ResultSetHeader>(
      "INSERT INTO activity (poster, banner, title) VALUES (?, ?, ?)",
      [poster, banner, title]
    );
    res.json({
      success: true,
      id: result.insertId,
      poster,
      banner,
      title,
      message: "Activity added successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error adding activity", error });
  }
};

export const editActivity = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No fields to update" });
  }

  // Buat query dinamis
  const setClause = fields.map((field) => `${field} = ?`).join(", ");

  try {
    const [result]: [ResultSetHeader, any] = await pool.query<ResultSetHeader>(
      `UPDATE activity SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }
    res.json({
      success: true,
      id,
      ...updates,
      message: "Activity updated successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error updating activity", error });
  }
};

export const deleteActivity = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [result]: [ResultSetHeader, any] = await pool.query<ResultSetHeader>(
      "DELETE FROM activity WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }
    res.json({ success: true, message: "Activity deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error deleting activity", error });
  }
};
