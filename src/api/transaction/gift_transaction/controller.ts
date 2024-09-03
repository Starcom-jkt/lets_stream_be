import { Request, Response } from "express";
import pool from "../../../../db";
import { RowDataPacket } from "mysql2";

// Mendapatkan semua transaksi hadiah dari pengguna yang sedang login

// Fungsi untuk memformat amount
const formatAmount = (amount: string): string => {
  const num = parseFloat(amount);
  return num.toFixed(2); // Format dengan dua angka di belakang koma
};

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
      `SELECT *,
        CASE 
          WHEN userId = ? THEN 'out' 
          WHEN receivedId = ? THEN 'in' 
          ELSE 'unknown' 
        END AS transactionType
      FROM gift_transaction 
      WHERE userId = ? OR receivedId = ? 
      ORDER BY createdAt DESC`,
      [userId, userId, userId, userId]
    );

    // Memformat amount untuk setiap transaksi
    const formattedTransactions = transactions.map((transaction: any) => ({
      ...transaction,
      amount: formatAmount(transaction.amount),
    }));

    res.json({ success: true, transactions: formattedTransactions });
  } catch (error: any) {
    console.error("Error fetching user transactions:", error); // Menambahkan log error untuk debugging
    res.status(500).json({
      success: false,
      message: "Error fetching user transactions",
      error: error.message, // Mengembalikan pesan error yang jelas
    });
  }
};
