import { Request, Response } from "express";
import pool from "../../../db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Get all activities
export const getAllActivities = async (req: Request, res: Response) => {
  try {
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

// Get activity detail by ID
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
    res.status(500).json({
      success: false,
      message: "Error fetching activity details",
      error,
    });
  }
};

// Add a new activity
export const postActivity = async (req: Request, res: Response) => {
  const { title } = req.body;
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  // Check if required fields are present
  if (!title || !files.poster || !files.banner) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const [result]: [ResultSetHeader, any] = await pool.query<ResultSetHeader>(
      "INSERT INTO activity (poster, banner, title) VALUES (?, ?, ?)",
      [
        files.poster[0].filename, // Assuming single file upload
        files.banner[0].filename, // Assuming single file upload
        title,
      ]
    );
    res.json({
      success: true,
      id: result.insertId,
      poster: files.poster[0].filename,
      banner: files.banner[0].filename,
      title,
      message: "Activity added successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error adding activity", error });
  }
};

// Edit an existing activity
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

  // Create dynamic query
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

// Delete an activity
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
