import { Request, Response } from "express";
import pool from "../../../../db";
import { ResultSetHeader } from "mysql2";
import { v4 as uuidv4 } from "uuid";
import { generateRtcToken } from "../token/controller";

const generateUniqueKey = () => {
  return uuidv4();
};

export const startStreamSession = async (req: Request, res: Response) => {
  const { agentId } = req.body;
  // const agentId = req.user.agentId;
  // const agentId = req.agent?.agentId; // Get the agentId from the logged-in user
  // if (!agentId) {
  //   return res.status(401).json({ message: "Unauthorized: No agentId found" });
  // }
  const token = generateRtcToken("channelName", 1, "tokentype", "uid");
  const status = 1;
  const streamId = generateUniqueKey();
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO stream_session (streamId, token,  status, agentId) VALUES (?, ?, ?, ?)",
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
    res.status(500).json({ message: "Error adding stream_session", error });
  }
};

export const endStreamSession = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE stream_session SET status = '0' WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "stream_session not found" });
    } else {
      res.json({ message: "stream_session ended successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error ending stream_session", error });
  }
};

export const getStreamSession = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT stream_session.*, agent.id AS agentId, agent.name, agent.username, agent.profilePicture, agent.streamChannel
      FROM stream_session 
      LEFT JOIN agent ON stream_session.streamId = agent.id
      WHERE stream_session.status = 1
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
