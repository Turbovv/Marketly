import { Server } from "socket.io";
import { Server as HttpServer } from "http";

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket"],
    pingTimeout: 30000,
    pingInterval: 10000,
    maxHttpBufferSize: 1e6,
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinRoom", (conversationId) => {
      socket.join(`conversation-${conversationId}`);
      console.log(`User ${socket.id} joined conversation ${conversationId}`);
    });

    socket.on("sendMessage", (message) => {
      io.to(`conversation-${message.conversationId}`).emit(
        "newMessage",
        message,
      );
      console.log(
        `Message sent in conversation ${message.conversationId}: ${message.content}`,
      );
    });

    socket.on("deleteConversation", (conversationId) => {
      io.to(`conversation-${conversationId}`).emit("conversationDeleted", {
        conversationId,
      });
      console.log(`Conversation ${conversationId} deleted`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};
