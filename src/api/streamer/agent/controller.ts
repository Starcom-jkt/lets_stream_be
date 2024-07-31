import { Request, Response } from "express";
import pool from "../../../../db";
import { ResultSetHeader } from "mysql2";
import bcrypt from "bcrypt";

export const getAllAgent = async (req: Request, res: Response) => {
  try {
    const [data] = await pool.query("SELECT * FROM agent");
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching agent", error });
  }
};

export const getDetailAgent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [data] = await pool.query("SELECT * FROM agent where id = ?", [id]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching agent", error });
  }
};

export const postAgent = async (req: Request, res: Response) => {
  const { name, username, password, streamChannel } = req.body;
  const saltRounds = 10;
  const profilePicture = req.file?.filename || "default.png";
  const bcryptedPassword = await bcrypt.hash(password, saltRounds);
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO agent (name, username, profilePicture, password, streamChannel) VALUES (?, ?, ?, ?, ?)",
      [name, username, profilePicture, bcryptedPassword, streamChannel]
    );
    res.json({
      id: result.insertId,
      name,
      username,
      profilePicture,
      streamChannel,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding Agent", error });
  }
};

export const editAgent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  // const profilePicture = req.file?.filename || "default.png";
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  // Buat query dinamis
  const setClause = fields.map((field) => `${field} = ?`).join(", ");

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE agent SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Agent not found" });
    } else {
      res.json({ id, ...updates });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating Agent", error });
  }
};

export const deleteAgent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM agent WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Agent not found" });
    } else {
      res.json({ message: "Agent deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting Agent", error });
  }
};
