import { Request, Response } from "express";
import pool from "../../../../db";
import { ResultSetHeader } from "mysql2";

export const getAllStreamSession = async (req: Request, res: Response) => {
  try {
    const [data] = await pool.query(
      "SELECT stream_session.*, agent.agentId FROM stream_session LEFT JOIN agent ON stream_session.streamId = agent.id"
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stream_session", error });
  }
};
