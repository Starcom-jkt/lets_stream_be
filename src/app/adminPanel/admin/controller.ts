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

    res.render("admin/index", {
      name: req.session.user?.username,
      title: "Let's Stream Admin",
      count: {
        agent: agentRows[0].count,
        user: userRows[0].count,
        game: gameRows[0].count,
        gift: giftRows[0].count,
      },
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};
