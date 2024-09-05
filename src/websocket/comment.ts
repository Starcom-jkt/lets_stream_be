import { Server as SocketIOServer } from "socket.io";
import pool from "../../db";
import { RowDataPacket } from "mysql2";
import { fetchBalance } from "../apiv2/testAccountBalance/controller";

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
          "SELECT giftName, img, giftLink, price FROM gift WHERE id = ?",
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

        const description = `payment for gift ${giftDetails.giftName} `;

        const recipientUser = recipientRows[0];

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

        // Broadcast the gift details to all clients in the room
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
    });

    socket.on("startBalanceUpdates", async (player_id: string) => {
      console.log(`Starting balance updates for player_id: ${player_id}`);

      let previousBalance: any = null;

      // Function to check balance periodically
      const checkBalance = async () => {
        try {
          const balance = await fetchBalance(player_id);

          // Jika balance berubah, kirim pembaruan ke klien
          if (balance !== previousBalance) {
            console.log(
              `Balance updated for player_id ${player_id}: ${balance}`
            );
            previousBalance = balance;
            socket.emit("balanceUpdate", { balance });
          }

          // Lanjutkan pengecekan balance setiap 5 detik
          setTimeout(checkBalance, 5000);
        } catch (error) {
          console.error("Error fetching balance:", error);
          socket.emit("error", { message: "Error fetching balance" });
        }
      };

      // Mulai pengecekan balance
      checkBalance();
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
}
