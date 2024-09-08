import { Request, Response } from "express";
import pool from "../../../../db";
import { RowDataPacket } from "mysql2";

export const index = async (req: Request, res: Response) => {
  try {
    const [agentRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM user where stream = 1"
    );
    const [userRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM user where stream = 0"
    );
    const [gameRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM game"
    );
    const [giftRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM gift"
    );
    const [transactionRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM gift_transaction"
    );

    res.render("adminv2/index", {
      name: req.session.user?.username,
      email: req.session.user?.email,
      title: "Dashboard - Let's Stream",
      count: {
        agent: agentRows[0].count,
        user: userRows[0].count,
        game: gameRows[0].count,
        gift: giftRows[0].count,
        transaction: transactionRows[0].count,
      },
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};
