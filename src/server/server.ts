import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
// import authRoutes from "./authRoutes";
import { initializeSocket } from "./socket.ts";

dotenv.config();

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST"],
}));

// app.use("/api", authRoutes);

initializeSocket(server);

app.get("/", (_req, res) => {
  res.send("Socket server is running!");
});

const PORT = Number(process.env.PORT) || 3001; 
const HOST = "0.0.0.0";

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
