import { Request, Response } from "express";
import pool from "../../../db";
import { ResultSetHeader } from "mysql2";

export const getAllMerchant = async (req: Request, res: Response) => {
  try {
    const [data] = await pool.query("SELECT * FROM merchant");
    res.json({ success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching merchants", error });
  }
};

export const getDetailmerchant = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [data] = await pool.query("SELECT * FROM merchant where id = ?", [
      id,
    ]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching merchants", error });
  }
};

export const postmerchant = async (req: Request, res: Response) => {
  const { merchantCode, merchantName, useBranchLogo } = req.body;
  const merchantLogo = req.file?.filename || "";

  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO merchant (merchantCode, merchantName, merchantLogo, useBranchLogo) VALUES (?, ?, ?, ?)",
      [merchantCode, merchantName, merchantLogo, useBranchLogo]
    );
    res.json({
      id: result.insertId,
      merchantCode,
      merchantName,
      merchantLogo,
      useBranchLogo,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding merchant", error });
  }
};

export const editmerchant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  console.log("updates", updates);
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  // Buat query dinamis
  const setClause = fields.map((field) => `${field} = ?`).join(", ");

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE merchant SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "merchant not found" });
    } else {
      res.json({ id, ...updates });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating merchant", error });
  }
};

export const deletemerchant = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM merchant WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "merchant not found" });
    } else {
      res.json({ message: "merchant deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting merchant", error });
  }
};
