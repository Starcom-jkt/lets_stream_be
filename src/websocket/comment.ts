import { Server as SocketIOServer } from "socket.io";

export default function setupWebSocket(io: SocketIOServer) {
  io.on("connection", (socket) => {
    console.log("A user connected");

    // Join a specific room based on channelName
    socket.on("join room", (channelName) => {
      socket.join(channelName);
      console.log(`User joined room: ${channelName}`);
    });

    // Listen for chat messages and broadcast to the specific room
    socket.on("chat message", ({ channelName, message, username }) => {
      // Broadcast the message to all clients in the same room
      io.to(channelName).emit("chat message", message, username);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
}
