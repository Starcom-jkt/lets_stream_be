import { Request, Response } from "express";
import pool from "../../../../db";
import { ResultSetHeader } from "mysql2";

export const getAllGenre = async (req: Request, res: Response) => {
  try {
    const [data] = await pool.query("SELECT * FROM genre");
    res.json({ success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching games", error });
  }
};

export const getDetailGenre = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [data] = await pool.query("SELECT * FROM genre where id = ?", [id]);
    res.json({ success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching games", error });
  }
};

export const postGenre = async (req: Request, res: Response) => {
  const genreName = req.body.genreName;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO genre (genreName) VALUES (?)",
      [genreName]
    );
    res.json({
      success: true,
      id: result.insertId,
      genreName,
      message: "genre added successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding game", error });
  }
};

export const editGenre = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  console.log("updates", updates);
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  // Buat query dinamis
  const setClause = fields.map((field) => `${field} = ?`).join(", ");

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE genre SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "genre not found" });
    } else {
      res.json({ id, ...updates });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating genre", error });
  }
};

export const deleteGenre = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM genre WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "genre not found" });
    } else {
      res.json({ message: "genre deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting genre", error });
  }
};
