import { Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../../../../db"; // Sesuaikan dengan konfigurasi db Anda
import { ResultSetHeader } from "mysql2";
require("dotenv").config();

export const editUser = async (req: Request, res: Response) => {
  const id = req.user?.id;
  const updates = req.body;

  console.log(req.body);

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (Object.keys(updates).length === 0 && !req.file) {
    return res.status(400).json({ message: "No fields to update" });
  }

  try {
    // Jika ingin mengubah username, pastikan username baru tidak ada di database
    if (updates.username) {
      const [userRows] = await pool.query(
        "SELECT id FROM user WHERE username = ?",
        [updates.username]
      );

      if ((userRows as any[]).length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Jika valid, set channelName sama dengan username
      updates.channelName = updates.username;
    }

    if (updates.password) {
      const saltRounds = 10;
      updates.password = await bcrypt.hash(updates.password, saltRounds);
    }

    // Jika ada file yang diunggah, tambahkan ke updates
    if (req.file) {
      updates.profilePicture = req.file.filename;
    }

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    // Buat query dinamis
    const setClause = fields.map((field) => `${field} = ?`).join(", ");

    // Pastikan setClause tidak kosong
    if (!setClause) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE user SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    } else {
      // Kembalikan data pengguna yang diperbarui, kecuali password yang di-hash
      const updatedUser: Record<string, any> = {};
      fields.forEach((field, index) => {
        if (field !== "password") {
          updatedUser[field] = values[index];
        }
      });

      return res.json({
        success: true,
        data: { id, ...updatedUser },
        message: "User updated successfully",
      });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Error updating user", error });
  }
};

export const getDetail = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const [result]: any = await pool.query(`SELECT * FROM user WHERE id = ?`, [
      userId,
    ]);

    if (result.length > 0) {
      const user = result[0];
      // Konversi balance menjadi angka float dengan 2 angka di belakang koma
      user.balance = parseFloat(Number(user.balance).toFixed(2));
      console.log("user", user);

      res.json({
        success: true,
        data: user,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error get detail user:", error);
    res.status(500).json({ message: "Error get detail user", error });
  }
};
