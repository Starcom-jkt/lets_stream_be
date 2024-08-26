import { Request, Response } from "express";
import pool from "../../../../db";
import { RowDataPacket, FieldPacket } from "mysql2"; // Import types for MySQL results

export const getAllStreamResults = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  console.log("userId", userId);
  if (!userId) {
    return res.status(401).json({ message: "Error: No userId found" });
  }

  try {
    const [data] = await pool.query(
      `
        SELECT * FROM stream_result where stream_sessionId IN (SELECT id FROM stream_session where userId = ?)
          `,
      [userId]
    );

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stream results", error });
  }
};

export const getTotalStream = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  console.log("userId", userId);
  // const userId = req.params.id;
  if (!userId) {
    return res.status(401).json({ message: "Error: No userId found" });
  }

  try {
    // Execute the SQL query to calculate the total duration for the user
    const [rows, fields]: [RowDataPacket[], FieldPacket[]] = await pool.query(
      `
    SELECT SUM(COALESCE(sr.duration, 0)) as totalDuration
        FROM stream_result sr
        JOIN stream_session ss ON sr.stream_sessionId = ss.id
        WHERE ss.userId = ?
      `,
      [userId]
    );

    // Access the total duration from the first row
    const totalDuration = rows[0]?.totalDuration;

    // Return the total duration as part of the JSON response
    res.json({ success: true, data: { totalDuration } });
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
