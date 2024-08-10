import { Request, Response } from "express";
import pool from "../../../db";
import { ResultSetHeader } from "mysql2";

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
