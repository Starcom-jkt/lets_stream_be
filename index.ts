import express, { Request, Response } from "express";
import dotenv from "dotenv";
import pool from "./db";
import path from "path";
import session from "express-session";
import cors from "cors";
import methodOverride from "method-override";
import flash from "connect-flash";

import giftRouter from "./src/api/gift/router";
import merchantRouter from "./src/api/merchant/router";
import gameRouter from "./src/api/game/router";

import adminRoutes from "./src/app/admin/router";
import agentRoutes from "./src/app/agent/router";
import gameRoutes from "./src/app/game/router";
import giftRoutes from "./src/app/gift/router";
import userRoutes from "./src/app/user/router";
import merchantRoutes from "./src/app/merchant/router";
import currencyRoutes from "./src/app/currency/router";

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
app.use("/game", gameRoutes);
app.use("/gift", giftRoutes);
app.use("/user", userRoutes);
app.use("/merchant", merchantRoutes);
app.use("/currency", currencyRoutes);

// Route for the admin view
app.get("/admin", (req, res) => {
  res.render("admin/index", { title: "Admin Panel" });
});
app.get("/agent", (req, res) => {
  res.render("admin/agent/index", { title: "Admin Panel" });
});
app.get("/user", (req, res) => {
  res.render("admin/user/index", { title: "Admin Panel" });
});
app.get("/game", (req, res) => {
  res.render("admin/game/index", { title: "Admin Panel" });
});
app.get("/gift", (req, res) => {
  res.render("admin/gift/index", { title: "Admin Panel" });
});
app.get("/currency", (req, res) => {
  res.render("admin/currency/index", { title: "Admin Panel" });
});
app.get("/merchant", (req, res) => {
  res.render("admin/merchant/index", { title: "Admin Panel" });
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
