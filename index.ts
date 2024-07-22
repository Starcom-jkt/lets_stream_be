import express, { Request, Response } from "express";
import dotenv from "dotenv";
import pool from "./db"; // pastikan ini adalah import koneksi database yang benar
import path from "path";
import session from "express-session";
import cors from "cors";
import methodOverride from "method-override";
import flash from "connect-flash";

import giftRouter from "./src/api/gift/router";
import merchantRouter from "./src/api/merchant/router";
import gameRouter from "./src/api/game/router";

import agentRoutes from "./src/app/agent/router";
import adminRoutes from "./src/app/admin/router";

dotenv.config();

const port = process.env.PORT || 3005;
const app = express();
const URL = `/api/v1`;

// view engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));
app.use("/adminlte", express.static(path.join(__dirname, "public/adminlte")));
app.use(methodOverride("_method"));

// Middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: {},
  })
);
app.use(flash());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// api
app.use(`${URL}/gift`, giftRouter);
app.use(`${URL}/merchant`, merchantRouter);
app.use(`${URL}/game`, gameRouter);

app.use("/agent", agentRoutes);
app.use("/admin", adminRoutes);

// Route for the admin view
app.get("/admin", (req, res) => {
  res.render("admin/index", { title: "Admin Panel" });
});
app.get("/agent", (req, res) => {
  res.render("admin/agent/index", { title: "Admin Panel" });
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
