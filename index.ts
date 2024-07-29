import express, { Request, Response } from "express";
import dotenv from "dotenv";
import pool from "./db";
import path from "path";
import session from "express-session";
import cors from "cors";
import methodOverride from "method-override";
import flash from "connect-flash";

// api
import giftRouter from "./src/api/user/gift/router";
import merchantRouter from "./src/api/user/merchant/router";
import gameRouter from "./src/api/user/game/router";
import tokenouter from "./src/api/streamer/token/router";
import agentRouter from "./src/api/streamer/agent/router";
import streamSessionRouter from "./src/api/streamer/streamSession/router";
import agentAuthRouter from "./src/api/streamer/auth/router";
import streamResultRouter from "./src/api/streamer/streamResults/router";
import streamerRouter from "./src/api/user/getStream/router";
import userAuthRouter from "./src/api/user/auth/router";

// admin view
import authRoutes from "./src/app/adminPanel/auth/router";
import adminRoutes from "./src/app/adminPanel/admin/router";
import agentRoutes from "./src/app/adminPanel/agent/router";
import gameRoutes from "./src/app/adminPanel/game/router";
import giftRoutes from "./src/app/adminPanel/gift/router";
import userRoutes from "./src/app/adminPanel/user/router";
import merchantRoutes from "./src/app/adminPanel/merchant/router";
import currencyRoutes from "./src/app/adminPanel/currency/router";
import languageRoutes from "./src/app/adminPanel/language/router";

dotenv.config();

const port = process.env.PORT || 3005;
const app = express();
const URL = `/api/v1`;

// view engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("public/uploads"));
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

declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      username: string;
      email: string;
      status: string;
      picture: string;
      name: string;
    };
  }
}

app.use(flash());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route for the api
app.use(`${URL}/gift`, giftRouter);
app.use(`${URL}/merchant`, merchantRouter);
app.use(`${URL}/game`, gameRouter);
app.use(`${URL}/token`, tokenouter);
app.use(`${URL}/streamer`, streamerRouter);
app.use(`${URL}/agent`, agentRouter);
app.use(`${URL}/user/auth`, userAuthRouter);

// Route for the api agent / streamer
app.use(`${URL}/stream_session`, streamSessionRouter);
app.use(`${URL}/agentAuth`, agentAuthRouter);
app.use(`${URL}/stream_result`, streamResultRouter);

// Route for the admin view
app.use("/admin/login", authRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/agent", agentRoutes);
app.use("/admin/game", gameRoutes);
app.use("/admin/gift", giftRoutes);
app.use("/admin/user", userRoutes);
app.use("/admin/merchant", merchantRoutes);
app.use("/admin/currency", currencyRoutes);
app.use("/admin/language", languageRoutes);

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
