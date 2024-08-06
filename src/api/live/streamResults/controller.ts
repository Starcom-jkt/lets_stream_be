import { Request, Response } from "express";
import pool from "../../../../db";

export const getAllStreamResults = async (req: Request, res: Response) => {
  const agentId = req.agent?.id;

  if (!agentId) {
    return res.status(401).json({ message: "Error: No agentId found" });
  }

  try {
    const [data] = await pool.query(
      `
        SELECT * FROM stream_result where stream_sessionId IN (SELECT id FROM stream_session where agentId = ?)
          `,
      [agentId]
    );

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stream results", error });
  }
};

export const getDetailStreamResult = async (req: Request, res: Response) => {
  const stream_sessionId = req.params.id;
  console.log("streamId", stream_sessionId);
  if (!stream_sessionId) {
    return res
      .status(401)
      .json({ success: false, message: "Error: no stream_sessionId found" });
  }

  const [data] = await pool.query(
    `
      SELECT * FROM stream_result 
      WHERE id = ?
    `,
    [stream_sessionId]
  );
  res.json({ success: true, data });
};
