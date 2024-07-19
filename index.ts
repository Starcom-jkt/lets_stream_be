console.log("Starting server...");

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import pool from "./db"; // pastikan ini adalah import koneksi database yang benar
import path from "path";
import session from "express-session";
import cors from "cors";

import giftRouter from "./src/api/gift/router";
import merchantRouter from "./src/api/merchant/router";
import gameRouter from "./src/api/game/router";

dotenv.config();

const port = process.env.PORT || 3002;
const app = express();
const URL = `/api/v1`;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: {},
  })
);
app.use(cors());
app.use(express.json());

// api
app.use(`${URL}/gift`, giftRouter);
app.use(`${URL}/merchant`, merchantRouter);
app.use(`${URL}/game`, gameRouter);

// routes
app.get("/", (req: Request, res: Response) => {
  res.render("index");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// database connection check
const connectToDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to the database");
    connection.release();
  } catch (err) {
    console.error("Error connecting to the database:", err);
  }
};

connectToDatabase();
