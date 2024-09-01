import { Request, Response } from "express";
import pool from "../../../db"; // Adjust the import according to your actual db configuration
import { ResultSetHeader } from "mysql2";

export const searchStream = async (req: Request, res: Response) => {
  try {
    const { username } = req.query;
    const [search] = await pool.query<ResultSetHeader[]>(
      `
         SELECT ss.*, u.profilePicture,
    u.username,
    u.channelname
         FROM stream_session ss
         JOIN user u ON ss.userId = u.id
         WHERE ss.status = 1 AND u.username LIKE ?
        `,
      [`%${username}%`]
    ); // Use wildcards for partial match

    res.json({
      success: true,
      data: search,
    });
  } catch (error) {
    console.error("Error searching stream:", error);
    res.status(500).json({ message: "Error searching stream", error });
  }
};

export const searchGame = async (req: Request, res: Response) => {
  try {
    const { gameName } = req.query;
    const [search] = await pool.query<ResultSetHeader[]>(
      `
          SELECT * FROM game WHERE gameName LIKE ?
        `,
      [`%${gameName}%`]
    ); // Use wildcards for partial match

    res.json({
      success: true,
      data: search,
    });
  } catch (error) {
    console.error("Error searching game:", error);
    res.status(500).json({ message: "Error searching game", error });
  }
};

export const searchGamebyGenre = async (req: Request, res: Response) => {
  try {
    const { genre } = req.body;
    const [search] = await pool.query<ResultSetHeader[]>(
      `
          SELECT * FROM game WHERE genre = ?
        `,
      [genre]
    );

    res.json({
      success: true,
      data: search,
    });
  } catch (error) {
    console.error("Error searching game:", error);
    res.status(500).json({ message: "Error searching game", error });
  }
};
