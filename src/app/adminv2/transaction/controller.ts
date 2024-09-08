import { Request, Response } from "express";
import pool from "../../../../db";
import { RowDataPacket } from "mysql2";

// Fungsi untuk mendapatkan total pemasukan dari User A
const getTotalIncomeFromUserA = async (userIdA: number): Promise<number> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT SUM(amount) AS totalIncome
     FROM gift_transaction
     WHERE receivedId = ?`,
    [userIdA]
  );

  return rows[0]?.totalIncome || 0;
};

// Fungsi untuk mendapatkan total pengeluaran dari User B
const getTotalExpensesFromUserB = async (userIdB: number): Promise<number> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT SUM(amount) AS totalExpenses
     FROM gift_transaction
     WHERE userId = ?`,
    [userIdB]
  );

  return rows[0]?.totalExpenses || 0;
};

// Controller untuk mendapatkan transaksi
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        gt.id,
        gt.userId,
        sender.username AS senderName,
        gt.receivedId,
        receiver.username AS receiverName,
        gt.giftId,
        gt.giftName,
        gt.amount,
        gt.description,
        gt.createdAt
      FROM gift_transaction gt
      LEFT JOIN user sender ON gt.userId = sender.id
      LEFT JOIN user receiver ON gt.receivedId = receiver.id
      ORDER BY gt.createdAt DESC`
    );

    res.render("adminv2/pages/transaction/index", {
      name: req.session.user?.name,
      email: req.session.user?.email,
      title: "Transactions",
      transactions: rows,
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

// Controller untuk mendapatkan summary transaksi
export const getTransactionSummary = async (req: Request, res: Response) => {
  try {
    const userIdA = parseInt(req.query.userIdA as string, 10); // Ambil ID user A dari query params
    const userIdB = parseInt(req.query.userIdB as string, 10); // Ambil ID user B dari query params

    // Menghitung total pemasukan dari User A dan total pengeluaran dari User B
    const totalIncomeFromUserA = await getTotalIncomeFromUserA(userIdA);
    const totalExpensesFromUserB = await getTotalExpensesFromUserB(userIdB);

    // Render halaman dengan data
    res.render("adminv2/pages/transaction/summary", {
      title: "Transaction Summary",
      totalIncomeFromUserA: totalIncomeFromUserA.toFixed(2),
      totalExpensesFromUserB: totalExpensesFromUserB.toFixed(2),
      userIdA,
      userIdB,
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};
