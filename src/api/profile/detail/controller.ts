import { Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../../../../db"; // Adjust the import according to your actual db configuration
import { ResultSetHeader } from "mysql2";
require("dotenv").config();

export const editUser = async (req: Request, res: Response) => {
  const id = req.user?.id;
  const updates = req.body;

  if (updates.password) {
    const saltRounds = 10;
    updates.password = await bcrypt.hash(updates.password, saltRounds);
  }

  const fields = Object.keys(updates);
  const values = Object.values(updates);

  // Buat query dinamis
  const setClause = fields.map((field) => `${field} = ?`).join(", ");

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE user SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "User not found" });
    } else {
      // Return the updated user data, excluding the hashed password
      const updatedUser: Record<string, any> = {}; // Menggunakan Record untuk tipe dinamis
      fields.forEach((field, index) => {
        if (field !== "password") {
          updatedUser[field] = values[index];
        }
      });

      res.json({
        success: true,
        data: { id, ...updatedUser },
        message: "User updated successfully",
      });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user", error });
  }
};

export const getDetail = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const [result] = await pool.query<ResultSetHeader>(
      `SELECT * FROM user WHERE id = ?`,
      [userId]
    );
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error get detail user:", error);
    res.status(500).json({ message: "Error get detail user", error });
  }
};
