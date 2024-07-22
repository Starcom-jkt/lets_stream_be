import { Request, Response } from "express";
import pool from "../../../db";
import { RowDataPacket } from "mysql2";

export const index = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM agent"
    );
    const count = rows[0].count;

    res.render("admin/index", {
      //   name: req.session.user.name,
      title: "Halaman Admin",
      count: {
        agent: count,
      },
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};
