import { Request, Response } from "express";
import pool from "../../../../db";
import { ResultSetHeader } from "mysql2";

export const getAllGifts = async (req: Request, res: Response) => {
  try {
    const [data] = await pool.query("SELECT * FROM gift");
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching gifts", error });
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
  const { img, gift_name, gift_link, price } = req.body;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO gift (img, giftName, giftLink, price) VALUES (?, ?, ?, ?)",
      [img, gift_name, gift_link, price]
    );
    res.json({ id: result.insertId, img, gift_name, gift_link, price });
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
