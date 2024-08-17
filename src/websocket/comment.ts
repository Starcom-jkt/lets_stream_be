// import { Server as SocketIOServer, Socket } from "socket.io";
// import pool from "../../db"; // Assuming you have a db module that exports the database connection pool
// import { RowDataPacket } from "mysql2";

// export default function setupWebSocket(io: SocketIOServer) {
//   io.on("connection", (socket: Socket) => {
//     console.log("A user connected");

//     socket.on("join", async ({ userId }) => {
//       try {
//         // Fetch the user's data to determine their stream status and channelName
//         const [userData] = await pool.query<RowDataPacket[]>(
//           "SELECT stream, channelName FROM user WHERE id = ?",
//           [userId]
//         );
//         console.log("Query Result:", userData);

//         if (!userData || userData.length === 0) {
//           socket.emit("error", "User not found");
//           return;
//         }

//         const { stream, channelName } = userData[0];

//         if (stream === 1 && channelName) {
//           // User is a streamer, they "own" the room
//           socket.join(channelName);
//           socket.emit(
//             "message",
//             `You have started streaming on channel ${channelName}`
//           );
//         } else if (stream === 0 && channelName) {
//           // User is a viewer, they join the room associated with channelName
//           socket.join(channelName);
//           socket.emit(
//             "message",
//             `You have joined the stream on channel ${channelName}`
//           );
//         } else {
//           socket.emit("error", "Invalid stream or channelName");
//         }
//       } catch (error) {
//         console.error("Error during join:", error);
//         socket.emit("error", "An error occurred while joining the stream");
//       }
//     });

//     socket.on("comment", async ({ userId, comment }) => {
//       try {
//         const [userData] = await pool.query<RowDataPacket[]>(
//           "SELECT channelName FROM user WHERE id = ?",
//           [userId]
//         );

//         if (!userData || userData.length === 0) {
//           socket.emit("error", "User not found");
//           return;
//         }

//         const { channelName } = userData[0];

//         if (channelName) {
//           const commentData = {
//             userId,
//             comment,
//             channelName,
//             createdAt: new Date(),
//           };

//           // Broadcast comment to all clients in the same room
//           io.to(channelName).emit("comment", commentData);
//         } else {
//           socket.emit("error", "Invalid channelName");
//         }
//       } catch (error) {
//         console.error("Error during comment:", error);
//         socket.emit("error", "An error occurred while sending the comment");
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("A user disconnected");
//     });
//   });
// }

import { Server as SocketIOServer, Socket } from "socket.io";
import pool from "../../db"; // Assuming you have a db module that exports the database connection pool
import { RowDataPacket } from "mysql2";

export default function setupWebSocket(io: SocketIOServer) {
  io.on("connection", (socket: Socket) => {
    console.log("A user connected");

    socket.on("join", async ({ userId }) => {
      try {
        // Fetch the user's data to determine their stream status and channelName
        const [userData] = await pool.query<RowDataPacket[]>(
          "SELECT stream, channelName FROM user WHERE id = ?",
          [userId]
        );
        console.log("Query Result:", userData);

        if (!userData || userData.length === 0) {
          socket.emit("error", "User not found");
          return;
        }

        const { stream, channelName } = userData[0];

        if (stream === 1 && channelName) {
          // User is a streamer, they "own" the room
          socket.join(channelName);
          socket.emit("message", {
            channelName,
            text: `You have started streaming on channel ${channelName}`,
          });
        } else if (stream === 0 && channelName) {
          // User is a viewer, they join the room associated with channelName
          socket.join(channelName);
          socket.emit("message", {
            channelName,
            text: `You have joined the stream on channel ${channelName}`,
          });
        } else {
          socket.emit("error", "Invalid stream or channelName");
        }
      } catch (error) {
        console.error("Error during join:", error);
        socket.emit("error", "An error occurred while joining the stream");
      }
    });

    socket.on("comment", async ({ userId, comment }) => {
      try {
        const [userData] = await pool.query<RowDataPacket[]>(
          "SELECT channelName FROM user WHERE id = ?",
          [userId]
        );

        if (!userData || userData.length === 0) {
          socket.emit("error", "User not found");
          return;
        }

        const { channelName } = userData[0];

        if (channelName) {
          const commentData = {
            userId,
            comment,
            channelName,
            createdAt: new Date(),
          };

          // Broadcast comment to all clients in the same room
          io.to(channelName).emit("comment", commentData);
        } else {
          socket.emit("error", "Invalid channelName");
        }
      } catch (error) {
        console.error("Error during comment:", error);
        socket.emit("error", "An error occurred while sending the comment");
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
}
