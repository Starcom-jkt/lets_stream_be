import { Request, Response } from "express";
import pool from "../../../../db"; // Adjust the import according to your actual db configuration
import { ResultSetHeader } from "mysql2";
require("dotenv").config();

export const getAllAgent = async (req: Request, res: Response) => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `SELECT * FROM user WHERE stream = 1`
    );
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error get detail user:", error);
    res.status(500).json({ message: "Error get detail user", error });
  }
};
