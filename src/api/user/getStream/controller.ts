import { Request, Response } from "express";
import pool from "../../../../db";

export const getStreamSession = async (req: Request, res: Response) => {
  try {
    // Adjust query to join on the correct fields
    const [rows]: any = await pool.query(`
      SELECT stream_session.*, agent.id AS agentId, agent.name, agent.username, agent.profilePicture, agent.streamChannel
      FROM stream_session 
      LEFT JOIN agent ON stream_session.agentId = agent.id
      WHERE stream_session.status = 1
    `);

    // Map the result to the desired structure
    const data = rows.map((row: any) => ({
      id: row.id,
      streamId: row.streamId,
      token: row.token,
      createdAt: row.createdAt,
      status: row.status,
      agent: row.agentId
        ? {
            id: row.agentId,
            name: row.name,
            username: row.username,
            profilePicture: row.profilePicture,
            streamChannel: row.streamChannel,
          }
        : null,
    }));

    res.json({ success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching stream_session",
        error,
      });
  }
};
