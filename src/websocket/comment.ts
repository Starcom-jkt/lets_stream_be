import { Server as SocketIOServer } from "socket.io";
import pool from "../../db";
import { RowDataPacket } from "mysql2";
import axios from "axios";
import https from "https";

export default function setupWebSocket(io: SocketIOServer) {
  io.on("connection", (socket) => {
    console.log("A user connected");

    // Join a specific room based on channelName
    // socket.on("join room", ({ channelName }) => {
    //   socket.join(channelName);

    //   // Broadcast to the room that the user has joined
    //   // io.to(channelName).emit(
    //   //   "user joined",
    //   //   `${username} has joined the channel`
    //   // );
    // });

    socket.on("join room", (channelName) => {
      socket.join(channelName);
    });

    // Listen for chat messages and broadcast to the specific room
    socket.on("chat message", ({ channelName, message, username }) => {
      // Broadcast the message to all clients in the same room
      io.to(channelName).emit("chat message", message, username);
      console.log("chat message", channelName, message, username);
    });

    // Handle sending of gifts
    // socket.on(
    //   "send gift",
    //   async ({ channelName, userId, giftId, tokenMpo, stream_sessionId }) => {
    //     console.log("send gift", channelName, userId, giftId);
    //     try {
    //       // Retrieve user balance for the sender
    //       const [userRows] = await pool.query<RowDataPacket[]>(
    //         "SELECT balance, username FROM user WHERE id = ?",
    //         [userId]
    //       );

    //       console.log(userRows);

    //       if (userRows.length === 0) {
    //         console.error(`User with ID ${userId} not found.`);
    //         return;
    //       }

    //       const userBalance = parseInt(userRows[0].balance); // get from MPO
    //       const senderName = userRows[0].username;

    //       // Retrieve gift details
    //       const [giftRows] = await pool.query<RowDataPacket[]>(
    //         "SELECT giftName, img, giftLink, price FROM gift WHERE id = ?",
    //         [giftId]
    //       );

    //       if (giftRows.length === 0) {
    //         console.error(`Gift with ID ${giftId} not found.`);
    //         return;
    //       }

    //       const giftDetails = giftRows[0];
    //       const giftPrice = parseInt(giftDetails.price);

    //       // check kondisi jika balance kurang dari price
    //       if (userBalance < giftPrice) {
    //         console.error(`User with ID ${userId} has insufficient balance.`);
    //         socket.emit("error", { message: "Insufficient balance." });
    //         return;
    //       }

    //       // Deduct gift price from user balance
    //       const newBalance = userBalance - giftPrice;

    //       if (isNaN(newBalance)) {
    //         console.error("Calculated balance is NaN, aborting update.");
    //         return;
    //       }

    //       await pool.query("UPDATE user SET balance = ? WHERE id = ?", [
    //         newBalance,
    //         userId,
    //       ]);

    //       // Retrieve the recipient user who owns the channelName
    //       const [recipientRows] = await pool.query<RowDataPacket[]>(
    //         "SELECT id, balance, username FROM user WHERE channelName = ?",
    //         [channelName]
    //       );

    //       if (recipientRows.length === 0) {
    //         console.error(`No user found with channelName ${channelName}.`);
    //         return;
    //       }

    //       const recipientBalance =
    //         parseInt(recipientRows[0].balance, 10) + giftPrice;

    //       if (isNaN(recipientBalance)) {
    //         console.error(
    //           "Calculated recipient balance is NaN, aborting update."
    //         );
    //         return;
    //       }

    //       await pool.query("UPDATE user SET balance = ? WHERE id = ?", [
    //         recipientBalance,
    //         recipientRows[0].id,
    //       ]);

    //       const description = `payment for gift ${giftDetails.giftName} `;

    //       const recipientUser = recipientRows[0];

    //       // send deduct balance to mpo
    //       // Verifikasi apakah pengguna berada di room yang benar
    //       if (!socket.rooms.has(channelName)) {
    //         console.error(`User not in channelName room: ${channelName}`);
    //         return;
    //       }

    //       const timeNow = () => {
    //         const now = new Date();
    //         const yyyy = now.getFullYear();
    //         const mm = String(now.getMonth() + 1).padStart(2, "0");
    //         const dd = String(now.getDate()).padStart(2, "0");
    //         const hh = String(now.getHours()).padStart(2, "0");
    //         const mi = String(now.getMinutes()).padStart(2, "0");
    //         const ss = String(now.getSeconds()).padStart(2, "0");
    //         return `${yyyy}.${mm}.${dd} ${hh}.${mi}.${ss}`;
    //       };

    //       const agent = new https.Agent({
    //         rejectUnauthorized: false, // Mengabaikan verifikasi sertifikat SSL
    //       });

    //       function generateRandomString(length: number): string {
    //         const characters =
    //           "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    //         let result = "";
    //         const charactersLength = characters.length;

    //         for (let i = 0; i < length; i++) {
    //           result += characters.charAt(
    //             Math.floor(Math.random() * charactersLength)
    //           );
    //         }

    //         return result;
    //       }

    //       // Example usage
    //       const bet_id = generateRandomString(4);

    //       try {
    //         // Menggunakan axios untuk deduct balance ke MPO

    //         const response = await axios.post(
    //           `https://str-stg.mixcdn.link/str/deduct`,
    //           {
    //             play_id: "8dxw86xw6u027",
    //             bet_id: bet_id,
    //             amount: giftPrice,
    //             gift: giftDetails.giftName,
    //             streamer: recipientRows[0].username,
    //             bet_time: timeNow(),
    //           },

    //           {
    //             headers: {
    //               "Content-Type": "application/json",
    //               Authorization: `Bearer ${tokenMpo}`,
    //             },
    //             httpsAgent: agent, // Tambahkan agent untuk mengabaikan SSL
    //           }
    //         );
    //         console.log("Balance deducted successfully:", response.data);
    //       } catch (error) {
    //         console.error("Error deducting balance:", error);
    //       }

    //       await pool.query(
    //         "INSERT INTO gift_transaction (userId, receivedId, giftId, giftName, amount, description) VALUES (?, ?, ?, ?, ?, ?)",
    //         [
    //           userId,
    //           recipientRows[0].id,
    //           giftId,
    //           giftDetails.giftName,
    //           giftPrice,
    //           description,
    //         ]
    //       );

    //       // Broadcast the gift details to all clients in the room
    //       io.to(channelName).emit("gift received", {
    //         giftDetails: giftDetails,
    //         giftName: giftDetails.giftName,
    //         img: giftDetails.img,
    //         giftLink: giftDetails.giftLink,
    //         price: giftDetails.price,
    //         senderId: userId,
    //         senderName: senderName,
    //         recipientId: recipientUser.id,
    //         recipientName: recipientUser.username,
    //       });
    //     } catch (err) {
    //       console.error("Error processing gift transaction:", err);
    //     }
    //   }
    // );

    socket.on(
      "send gift",
      async ({ channelName, userId, giftId, tokenMpo }) => {
        console.log("send gift", channelName, userId, giftId);
        try {
          const [userRows] = await pool.query<RowDataPacket[]>(
            "SELECT balance, username FROM user WHERE id = ?",
            [userId]
          );

          if (userRows.length === 0) {
            console.error(`User with ID ${userId} not found.`);
            return;
          }

          const userBalance = parseInt(userRows[0].balance);
          const senderName = userRows[0].username;

          const [giftRows] = await pool.query<RowDataPacket[]>(
            "SELECT giftName, img, giftLink, price FROM gift WHERE id = ?",
            [giftId]
          );

          if (giftRows.length === 0) {
            console.error(`Gift with ID ${giftId} not found.`);
            return;
          }

          const giftDetails = giftRows[0];
          const giftPrice = parseInt(giftDetails.price);

          if (userBalance < giftPrice) {
            console.error(`User with ID ${userId} has insufficient balance.`);
            socket.emit("error", { message: "Insufficient balance." });
            return;
          }

          const newBalance = userBalance - giftPrice;

          if (isNaN(newBalance)) {
            console.error("Calculated balance is NaN, aborting update.");
            return;
          }

          await pool.query("UPDATE user SET balance = ? WHERE id = ?", [
            newBalance,
            userId,
          ]);

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

          const description = `payment for gift ${giftDetails.giftName} `;

          const recipientUser = recipientRows[0];

          if (!socket.rooms.has(channelName)) {
            console.error(`User not in channelName room: ${channelName}`);
            return;
          }

          const timeNow = () => {
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, "0");
            const dd = String(now.getDate()).padStart(2, "0");
            const hh = String(now.getHours()).padStart(2, "0");
            const mi = String(now.getMinutes()).padStart(2, "0");
            const ss = String(now.getSeconds()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
          };

          const agent = new https.Agent({
            rejectUnauthorized: false,
          });

          function generateRandomString(length: number): string {
            const characters =
              "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let result = "";
            const charactersLength = characters.length;

            for (let i = 0; i < length; i++) {
              result += characters.charAt(
                Math.floor(Math.random() * charactersLength)
              );
            }

            return result;
          }

          const bet_id = generateRandomString(6);

          async function sendGiftDeductWithRetry(
            data: any,
            retries = 3,
            delay = 5000
          ) {
            try {
              const response = await axios.post(
                `https://str-stg.mixcdn.link/str/deduct`,
                data,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenMpo}`,
                  },
                  httpsAgent: agent,
                }
              );
              console.log("Balance deducted successfully:", response.data);
              return response.data;
            } catch (error: any) {
              if (retries > 0 && error.code === "EAI_AGAIN") {
                console.log(`Retrying... (${retries} retries left)`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                return sendGiftDeductWithRetry(data, retries - 1, delay);
              } else {
                console.error(
                  "Error deducting balance:",
                  error.response?.data || error.message || error
                );
                throw error;
              }
            }
          }

          await sendGiftDeductWithRetry({
            play_id: "8dxw86xw6u027",
            bet_id: bet_id,
            amount: giftPrice,
            gift: giftDetails.giftName,
            streamer: recipientUser.username,
            bet_time: "2024-09-02 11:57:21",
          });

          await pool.query(
            "INSERT INTO gift_transaction (userId, receivedId, giftId, giftName, amount, description) VALUES (?, ?, ?, ?, ?, ?)",
            [
              userId,
              recipientRows[0].id,
              giftId,
              giftDetails.giftName,
              giftPrice,
              description,
            ]
          );

          io.to(channelName).emit("gift received", {
            giftDetails: giftDetails,
            giftName: giftDetails.giftName,
            img: giftDetails.img,
            giftLink: giftDetails.giftLink,
            price: giftDetails.price,
            senderId: userId,
            senderName: senderName,
            recipientId: recipientUser.id,
            recipientName: recipientUser.username,
          });
        } catch (err) {
          console.error("Error processing gift transaction:", err);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
}
