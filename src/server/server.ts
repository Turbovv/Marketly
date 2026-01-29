import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./authRoutes";
import { initializeSocket } from "./socket";

dotenv.config();

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST"],
}));

app.use("/api", authRoutes);

initializeSocket(server);

console.log("AUTH_DISCORD_ID:", process.env.AUTH_DISCORD_ID);
console.log("DATABASE_URL:", process.env.DATABASE_URL);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

server.listen(3001, "0.0.0.0", () => {
  console.log("Server running on http://192.168.0.101:3001");
});
