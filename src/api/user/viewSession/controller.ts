import { Request, Response } from "express";
import pool from "../../../../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export const getDetailStreamSession = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows]: any = await pool.query(
      `
        SELECT stream_session.*, agent.id AS agentId, agent.name, agent.username, agent.profilePicture, agent.streamChannel
        FROM stream_session 
        LEFT JOIN agent ON stream_session.agentId = agent.id
        WHERE stream_session.id = ?
      `,
      [id]
    );

    const data = rows.map((row: any) => ({
      id: row.id,
      streamId: row.streamId,
      token: row.token,
      createdAt: row.createdAt,
      status: row.status,
      agent: row.agentId,
      thumbnail: row.thumbnail,
      title: row.title
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
      .json({ success: true, message: "Error fetching stream_session", error });
  }
};
