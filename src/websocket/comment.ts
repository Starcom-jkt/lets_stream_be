import { Server as SocketIOServer } from "socket.io";
import pool from "../../db";
import { RowDataPacket } from "mysql2";

export default function setupWebSocket(io: SocketIOServer) {
  io.on("connection", (socket) => {
    console.log("A user connected");

    // Join a specific room based on channelName
    socket.on("join room", ({ channelName, username }) => {
      socket.join(channelName);

      // Broadcast to the room that the user has joined
      io.to(channelName).emit(
        "user joined",
        `${username} has joined the channel`
      );
    });

    // Listen for chat messages and broadcast to the specific room
    socket.on("chat message", ({ channelName, message, username }) => {
      // Broadcast the message to all clients in the same room
      io.to(channelName).emit("chat message", message, username);
    });

    // Listen for gift sending
    interface Gift {
      giftName: string;
      img: string;
      price: number;
    }

    socket.on("send gift", async ({ channelName, userId, giftId }) => {
      try {
        // Retrieve user balance
        const [userRows] = await pool.query<RowDataPacket[]>(
          "SELECT balance FROM user WHERE id = ?",
          [userId]
        );

        if (userRows.length === 0) {
          console.error(`User with ID ${userId} not found.`);
          return;
        }

        const userBalance = userRows[0].balance;

        // Retrieve gift details
        const [giftRows] = await pool.query<Gift[] & RowDataPacket[]>(
          "SELECT giftName, img, price FROM gift WHERE id = ?",
          [giftId]
        );

        if (giftRows.length === 0) {
          console.error(`Gift with ID ${giftId} not found.`);
          return;
        }

        const giftDetails = giftRows[0] as Gift;

        if (userBalance < giftDetails.price) {
          console.error(`User with ID ${userId} has insufficient balance.`);
          socket.emit("error", { message: "Insufficient balance." });
          return;
        }

        // Deduct gift price from user balance
        const newBalance = userBalance - giftDetails.price;

        await pool.query("UPDATE user SET balance = ? WHERE id = ?", [
          newBalance,
          userId,
        ]);

        // Insert into gift_transaction table
        await pool.query(
          "INSERT INTO gift_transaction (userId, giftId) VALUES (?, ?)",
          [userId, giftId]
        );

        // Broadcast the gift details to all clients in the room
        io.to(channelName).emit("gift received", {
          giftName: giftDetails.giftName,
          img: giftDetails.img,
          price: giftDetails.price,
          userId,
        });

        io.to(channelName).emit("test", {
          giftName: "babo",
        });

        console.log(
          `Gift ${giftDetails.giftName} sent by user ${userId} to channel ${channelName}`
        );
      } catch (err) {
        console.error("Error processing gift transaction:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
}
