import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);

app.use(cors({ origin: "http://localhost:3000", methods: ["GET", "POST"] }));

const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("joinRoom", (conversationId) => {
    socket.join(`conversation-${conversationId}`);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on("sendMessage", (message) => {
    io.to(`conversation-${message.conversationId}`).emit("newMessage", message);
    console.log(`Message sent in conversation ${message.conversationId}: ${message.content}`);
  });

  socket.on("deleteConversation", (conversationId) => {
    io.to(`conversation-${conversationId}`).emit("conversationDeleted", { conversationId });
    console.log(`Conversation ${conversationId} deleted`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3001, () => console.log("Server running on http://localhost:3001"));
