import { Request, Response } from "express";
import pool from "../../../../db";
import { RowDataPacket } from "mysql2";

// Mendapatkan semua transaksi hadiah dari pengguna yang sedang login
export const getUserTransactions = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated" });
  }

  try {
    // Mengambil semua transaksi dari pengguna yang sedang login
    const [transactions]: [RowDataPacket[], any] = await pool.query(
      "SELECT * FROM gift_transaction WHERE userId = ?",
      [userId]
    );

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user transactions",
      error,
    });
  }
};
