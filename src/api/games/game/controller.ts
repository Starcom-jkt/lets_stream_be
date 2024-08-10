import { Request, Response } from "express";
import pool from "../../../../db";
import { ResultSetHeader } from "mysql2";

export const getAllGame = async (req: Request, res: Response) => {
  try {
    const [data]: any = await pool.query("SELECT * FROM game");
    const [genreResult] = await pool.query("SELECT * FROM genre WHERE id = ?", [
      data.genre,
    ]);
    const dataGame = data.map((row: any) => ({
      id: row.id,
      genre: row.genre,
      // genreName: genre[0].genreName,
      gameCode: row.gameCode,
      gameName: row.gameName,
      gameLink: row.gameLink,
      gameImg: row.gameImg,
      createdAt: row.createdAt,
    }));
    res.json({ success: true, dataGame, genreResult });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching games", error });
  }
};

export const getDetailGame = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [data] = await pool.query("SELECT * FROM game where id = ?", [id]);
    res.json({ success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching games", error });
  }
};

export const postGame = async (req: Request, res: Response) => {
  const { genre, gameCode, gameName, gameLink } = req.body;
  // const gameImg = req.file?.filename || "";
  const gameImg = req.body.gameImg;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO game (genre, gameCode, gameName, gameLink, gameImg) VALUES (?, ?, ?, ?, ?)",
      [genre, gameCode, gameName, gameLink, gameImg]
    );
    res.json({
      success: true,
      id: result.insertId,
      gameCode,
      gameName,
      gameLink,
      gameImg,
      message: "game added successfully",
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
