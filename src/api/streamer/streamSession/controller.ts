import { Request, Response } from "express";
import pool from "../../../../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { v4 as uuidv4 } from "uuid";
import { generateRtcToken } from "../token/controller";

declare global {
  namespace Express {
    interface Request {
      agent?: {
        agentId?: number;
        streamChannel?: string;
        streamer?: string;
        id?: number;
      };
    }
  }
}

const generateUniqueKey = () => {
  return uuidv4();
};

export const startStreamSession = async (req: Request, res: Response) => {
  const agentId = req.agent?.id;
  if (!agentId) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No agentId found" });
  }

  const channelName = req.agent?.streamChannel ?? "";
  const uid = agentId.toString();

  try {
    const [existingSessions] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM stream_session WHERE agentId = ? AND status = 1",
      [agentId]
    );

    if (existingSessions.length > 0) {
      return res
        .status(400)
        .json({ success: true, message: "You're on the live" });
    }

    const token = generateRtcToken(channelName, uid);
    const status = 1;
    const streamId = generateUniqueKey();

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO stream_session (streamId, token, status, agentId) VALUES (?, ?, ?, ?)",
      [streamId, token, status, agentId]
    );

    res.json({
      id: result.insertId,
      streamId,
      agentId,
      token,
      status,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error adding stream session", error });
  }
};

export const endStreamSession = async (req: Request, res: Response) => {
  const { id } = req.params;
  // const {id} =
  const agentId = req.agent?.id; // Get the logged-in agent's ID

  if (!agentId) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No agentId found" });
  }

  try {
    // Fetch the stream session to verify ownership and get createdAt
    const [sessionRows]: any = await pool.query(
      `
      SELECT agentId, status, createdAt FROM stream_session 
      WHERE id = ?
    `,
      [id]
    );

    if (sessionRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Stream session not found" });
    }

    const session = sessionRows[0];

    // Check if the session is already ended or the agent is not authorized
    if (session.status === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Stream session is already ended" });
    }

    if (parseInt(session.agentId) !== agentId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to end this stream session",
      });
    }

    // Calculate the duration from createdAt to now
    const createdAt = new Date(session.createdAt);
    const now = new Date();
    const duration = Math.floor((now.getTime() - createdAt.getTime()) / 1000); // Duration in seconds

    // Calculate total_view (Assuming there is a table named `views` with column `stream_session_id`)
    const [viewRows]: any = await pool.query(
      `SELECT COUNT(*) AS total_view FROM view_session WHERE stream_sessionId = ?`,
      [id]
    );
    const total_view = viewRows[0].total_view;

    // Insert into stream_result
    await pool.query(
      `INSERT INTO stream_result (stream_sessionId, duration, total_view) VALUES (?, ?, ?)`,
      [id, duration, total_view]
    );

    // Update the stream session status to ended
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE stream_session SET status = '0' WHERE id = ?",
      [id]
    );

    // remove token from stream session
    const [removeToken] = await pool.query<ResultSetHeader>(
      "UPDATE stream_session SET token = NULL WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Stream session not found" });
    }

    res.json({ success: true, message: "Stream session ended successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error ending stream session", error });
  }
};

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
    res.status(500).json({
      success: false,
      message: "Error fetching stream_session",
      error,
    });
  }
};

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
      .json({ success: true, message: "Error fetching stream_session", error });
  }
};

export const getAllStreamSession = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT stream_session.*, agent.id AS agentId, agent.name, agent.username, agent.profilePicture, agent.streamChannel
      FROM stream_session 
      LEFT JOIN agent ON stream_session.streamId = agent.id
    `);

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
    res.status(500).json({ message: "Error fetching stream_session", error });
  }
};
