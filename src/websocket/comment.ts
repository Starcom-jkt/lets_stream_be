// import { Server as SocketIOServer } from "socket.io";
// import pool from "../../db";
// import { RowDataPacket } from "mysql2";

// export default function setupWebSocket(io: SocketIOServer) {
//   io.on("connection", (socket) => {
//     console.log("A user connected");

//     // Join a specific room based on channelName
//     socket.on("join room", ({ channelName, username }) => {
//       socket.join(channelName);

//       // Broadcast to the room that the user has joined
//       io.to(channelName).emit(
//         "user joined",
//         `${username} has joined the channel`
//       );
//     });

//     // Listen for chat messages and broadcast to the specific room
//     socket.on("chat message", ({ channelName, message, username }) => {
//       // Broadcast the message to all clients in the same room
//       io.to(channelName).emit("chat message", message, username);
//     });

//     socket.on("send gift", async ({ channelName, userId, giftId }) => {
//       try {
//         // Retrieve user balance
//         const [userRows] = await pool.query<RowDataPacket[]>(
//           "SELECT balance FROM user WHERE id = ?",
//           [userId]
//         );

//         if (userRows.length === 0) {
//           console.error(`User with ID ${userId} not found.`);
//           return;
//         }

//         const userBalance = userRows[0].balance;

//         // Retrieve gift details
//         const [giftRows] = await pool.query<RowDataPacket[]>(
//           "SELECT giftName, img, price FROM gift WHERE id = ?",
//           [giftId]
//         );

//         if (giftRows.length === 0) {
//           console.error(`Gift with ID ${giftId} not found.`);
//           return;
//         }

//         const giftDetails = giftRows[0];

//         if (userBalance < giftDetails.price) {
//           console.error(`User with ID ${userId} has insufficient balance.`);
//           socket.emit("error", { message: "Insufficient balance." });
//           return;
//         }

//         // Deduct gift price from user balance
//         const newBalance = userBalance - giftDetails.price;

//         await pool.query("UPDATE user SET balance = ? WHERE id = ?", [
//           newBalance,
//           userId,
//         ]);

//         // Insert into gift_transaction table
//         await pool.query(
//           "INSERT INTO gift_transaction (userId, giftId) VALUES (?, ?)",
//           [userId, giftId]
//         );

//         // Broadcast the gift details to all clients in the room
//         io.to(channelName).emit("gift received", {
//           giftName: giftDetails.giftName,
//           img: giftDetails.img,
//           price: giftDetails.price,
//           userId,
//         });

//         io.to(channelName).emit("test", {
//           giftName: "babo",
//         });

//         console.log(
//           `Gift ${giftDetails.giftName} sent by user ${userId} to channel ${channelName}`
//         );
//       } catch (err) {
//         console.error("Error processing gift transaction:", err);
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("A user disconnected");
//     });
//   });
// }

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

    // Handle sending of gifts
    socket.on("send gift", async ({ channelName, userId, giftId }) => {
      try {
        // Retrieve user balance for the sender
        const [userRows] = await pool.query<RowDataPacket[]>(
          "SELECT balance, username FROM user WHERE id = ?",
          [userId]
        );

        if (userRows.length === 0) {
          console.error(`User with ID ${userId} not found.`);
          return;
        }

        const userBalance = parseInt(userRows[0].balance, 10); // Convert to integer
        const senderName = userRows[0].username;

        // Retrieve gift details
        const [giftRows] = await pool.query<RowDataPacket[]>(
          "SELECT giftName, img, price FROM gift WHERE id = ?",
          [giftId]
        );

        if (giftRows.length === 0) {
          console.error(`Gift with ID ${giftId} not found.`);
          return;
        }

        const giftDetails = giftRows[0];
        const giftPrice = parseInt(giftDetails.price, 10); // Convert to integer

        if (userBalance < giftPrice) {
          console.error(`User with ID ${userId} has insufficient balance.`);
          socket.emit("error", { message: "Insufficient balance." });
          return;
        }

        // Deduct gift price from user balance
        const newBalance = userBalance - giftPrice;

        if (isNaN(newBalance)) {
          console.error("Calculated balance is NaN, aborting update.");
          return;
        }

        await pool.query("UPDATE user SET balance = ? WHERE id = ?", [
          newBalance,
          userId,
        ]);

        // Retrieve the recipient user who owns the channelName
        const [recipientRows] = await pool.query<RowDataPacket[]>(
          "SELECT id, balance, username FROM user WHERE channelName = ?",
          [channelName]
        );

        if (recipientRows.length === 0) {
          console.error(`No user found with channelName ${channelName}.`);
          return;
        }

        const recipientBalance =
          parseInt(recipientRows[0].balance, 10) + giftPrice;

        if (isNaN(recipientBalance)) {
          console.error(
            "Calculated recipient balance is NaN, aborting update."
          );
          return;
        }

        await pool.query("UPDATE user SET balance = ? WHERE id = ?", [
          recipientBalance,
          recipientRows[0].id,
        ]);

        const recipientUser = recipientRows[0];
        console.log("User Data:", userRows[0]); // Data pengguna
        console.log("Gift Data:", giftRows[0]); // Data hadiah
        console.log("Recipient Data:", recipientRows[0]); // Data penerima

        // Broadcast the gift details to all clients in the room
        io.to(channelName).emit("gift received", {
          giftName: giftDetails.giftName,
          img: giftDetails.img,
          price: giftDetails.price,
          senderId: userId,
          senderName: senderName,
          recipientId: recipientUser.id,
          recipientName: recipientUser.username,
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
