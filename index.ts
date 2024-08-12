import express, { Request, Response } from "express";
import dotenv from "dotenv";
import pool from "./db";
import path from "path";
import session from "express-session";
import cors from "cors";
import methodOverride from "method-override";
import flash from "connect-flash";

//api v2
import merchantRouter from "./src/api/merchant/router";
import tokenouter from "./src/api/token/router";
import giftRouter from "./src/api/gift/router";
import gameRouter from "./src/api/games/game/router";
import genreRouter from "./src/api/games/genre/router";
import userAuth from "./src/api/profile/auth/router";
import streamSessionRouter from "./src/api/live/streamSession/router";
import streamResultRouter from "./src/api/live/streamResults/router";
import viewStreamRouter from "./src/api/live/viewStream/router";

// apijoyo
import apiV2Routes from "./src/apiv2/token/router";

// admin view
import authRoutes from "./src/app/adminPanel/auth/router";
import adminRoutes from "./src/app/adminPanel/admin/router";
import agentRoutes from "./src/app/adminPanel/agent/router";
import userRoutes from "./src/app/adminPanel/user/router";
import requestRoutes from "./src/app/adminPanel/requestStream/router";
import gameRoutes from "./src/app/adminPanel/game/router";
import giftRoutes from "./src/app/adminPanel/gift/router";
import merchantRoutes from "./src/app/adminPanel/merchant/router";
import currencyRoutes from "./src/app/adminPanel/currency/router";
import languageRoutes from "./src/app/adminPanel/language/router";

import testRoutes from "./src/app/adminPanel/test/router";

dotenv.config();

const port = process.env.PORT || 3006;
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
app.use(`${URL}/token`, tokenouter);
app.use(`${URL}/gift`, giftRouter);
app.use(`${URL}/merchant`, merchantRouter);
app.use(`${URL}/game`, gameRouter);
app.use(`${URL}/genre`, genreRouter);
app.use(`${URL}/auth`, userAuth);
app.use(`${URL}/stream_session`, streamSessionRouter);
app.use(`${URL}/view_stream`, viewStreamRouter);
app.use(`${URL}/stream_result`, streamResultRouter);

// Route for the admin view
// app.get("/", (req: Request, res: Response) => {
//   // res.redirect("/admin");
//   res.send("Hello World!");
// });

app.use("/admin/login", authRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/agent", agentRoutes);
app.use("/admin/user", userRoutes);
app.use("/admin/request", requestRoutes);
app.use("/admin/game", gameRoutes);
app.use("/admin/gift", giftRoutes);
app.use("/admin/merchant", merchantRoutes);
app.use("/admin/currency", currencyRoutes);
app.use("/admin/language", languageRoutes);
app.use("/test", testRoutes);

// api v2
app.use("/", apiV2Routes);

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
