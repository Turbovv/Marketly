import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import path from "path";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let activeConversations: Record<number, string[]> = {};  

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  socket.on("joinRoom", (conversationId: number) => {
    socket.join(`conversation-${conversationId}`);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on("sendMessage", (message: { conversationId: number, content: string, senderId: string, senderName: string }) => {
    io.to(`conversation-${message.conversationId}`).emit("newMessage", message);
    console.log(`Message sent to conversation ${message.conversationId}: ${message.content}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected: " + socket.id);
  });
});

const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("Hello World! Express server is running.");
});

server.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
