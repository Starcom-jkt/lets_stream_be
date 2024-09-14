import express, { Request, Response } from "express";
import dotenv from "dotenv";
import pool from "./db";
import path from "path";
import session from "express-session";
import cors from "cors";
import methodOverride from "method-override";
import flash from "connect-flash";
import request from "request";
import http from "http"; // Import the HTTP module
import { Server as SocketIOServer } from "socket.io"; // Import Socket.IO

//api v2
import merchantRouter from "./src/api/merchant/router";
import tokenouter from "./src/api/token/router";
import giftRouter from "./src/api/gift/router";
import gameRouter from "./src/api/games/game/router";
import genreRouter from "./src/api/games/genre/router";
import userAuth from "./src/api/profile/auth/router";
import profileRouter from "./src/api/profile/detail/router";
import streamSessionRouter from "./src/api/live/streamSession/router";
import streamResultRouter from "./src/api/live/streamResults/router";
import viewStreamRouter from "./src/api/live/viewStream/router";
import notificationRouter from "./src/api/notifications/router";
import searchRouter from "./src/api/search/router";
import activityRouter from "./src/api/activity/router";
import giftTransactionRouter from "./src/api/transaction/gift_transaction/router";
import agentRouter from "./src/api/profile/agent/router";

// apijoyo
import apiV2Routes from "./src/apiv2/token/router";

// api test
import apiTestRoutes from "./src/apiv2/testAccountBalance/router";
import integratorRoutes from "./src/apiv2/integrator/router";

// admin viewV2
import adminv2Routes from "./src/app/adminv2/admins/router";
import dashboardv2Routes from "./src/app/adminv2/dashboard/router";
import userv2Routes from "./src/app/adminv2/user/router";
import agentv2Routes from "./src/app/adminv2/agent/router";
import giftv2Routes from "./src/app/adminv2/gift/router";
import gamev2Routes from "./src/app/adminv2/game/router";
import transactionv2Routes from "./src/app/adminv2/transaction/router";
import authv2Routes from "./src/app/adminv2/auth/router";

// Import the WebSocket server
import setupWebSocket from "./src/websocket/comment";
import axios from "axios";

dotenv.config();

const port = process.env.PORT || 3006;
const app = express();
const URL = `/api/v1`;

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO server on the HTTP server
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Allow all origins for testing
    methods: ["GET", "POST"],
  },
});

// Initialize WebSocket server
setupWebSocket(io);

// view engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("public/uploads"));
app.use("/adminlte", express.static(path.join(__dirname, "public/adminlte")));
app.use("/corona", express.static(path.join(__dirname, "public/corona")));
app.use(methodOverride("_method"));

// Middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true, // Mencegah akses cookies melalui JavaScript
      sameSite: "none", // Memungkinkan cookies diakses dalam iframe lintas domain
      // secure: true, // Hanya mengizinkan cookie melalui HTTPS
      maxAge: 24 * 60 * 60 * 1000, // Masa berlaku cookies (1 hari)
    },
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
// app.use(
//   cors({
//     origin: ["http://localhost:5173", "https://innovativetechnology.my.id"], // Ganti dengan URL frontend yang benar
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true, // Mengizinkan pengiriman cookies atau credentials
//   })
// );

app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow necessary HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Add other headers if needed
  })
);
// app.options("*", (req, res) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.sendStatus(200);
// }); // Menangani OPTIONS preflight request

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/proxy", async (req: Request, res: Response) => {
  try {
    const response = await axios.get("https://demo.livegamesstream.com");
    console.log(response.data);
    res.send(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching data from livegamesstream.com");
  }
});

app.get("/proxy1", async (req: Request, res: Response) => {
  try {
    const response = await axios.get(
      "https://demo.livegamesstream.com/play/36d/"
    );
    console.log(response.data);
    res.send(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching data from livegamesstream.com");
  }
});

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
app.use(`${URL}/notifications`, notificationRouter);
app.use(`${URL}/profile`, profileRouter);
app.use(`${URL}/search`, searchRouter);
app.use(`${URL}/activity`, activityRouter);
app.use(`${URL}/gift_transaction`, giftTransactionRouter);
app.use(`${URL}/agent`, agentRouter);

// route testAPi
app.use(`${URL}/str`, apiTestRoutes);
app.use(`${URL}/tr`, integratorRoutes);

// Route for the admin view
app.use("/admin/dashboard", dashboardv2Routes);
app.use("/admin/user", userv2Routes);
app.use("/admin/agent", agentv2Routes);
app.use("/admin/gift", giftv2Routes);
app.use("/admin/game", gamev2Routes);
app.use("/admin/transaction", transactionv2Routes);
app.use("/admin/auth", authv2Routes);
app.use("/admins", adminv2Routes);

// api v2
app.use("/", apiV2Routes);

// Start the server
server.listen(port, () => {
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
