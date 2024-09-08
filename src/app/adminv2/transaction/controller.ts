import { Request, Response } from "express";
import pool from "../../../../db";
import { RowDataPacket } from "mysql2";

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
