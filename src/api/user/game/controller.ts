import { Request, Response } from "express";
import pool from "../../../../db";
import { ResultSetHeader } from "mysql2";

export const getAllGame = async (req: Request, res: Response) => {
  try {
    const [data] = await pool.query("SELECT * FROM game");
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching games", error });
  }
};

export const getDetailGame = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [data] = await pool.query("SELECT * FROM game where id = ?", [id]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching games", error });
  }
};

export const postGame = async (req: Request, res: Response) => {
  const { gameCode, gameName } = req.body;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO game (gameCode, gameName) VALUES (?, ?)",
      [gameCode, gameName]
    );
    res.json({
      id: result.insertId,
      gameCode,
      gameName,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding game", error });
  }
};

export const editGame = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  console.log("updates", updates);
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  // Buat query dinamis
  const setClause = fields.map((field) => `${field} = ?`).join(", ");

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE game SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "game not found" });
    } else {
      res.json({ id, ...updates });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating game", error });
  }
};

export const deleteGame = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM game WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "game not found" });
    } else {
      res.json({ message: "game deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting game", error });
  }
};
