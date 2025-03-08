import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./db/schema";

interface CustomRequest extends express.Request {
  user?: any;
}

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "+8APs0PI/xDA6v42wSxTcS++8hdIC6/5r1taMlGaq/I=";

router.post("/register", async (req, res: any) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res: any) => {
  const { email, password } = req.body;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

const verifyToken = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    res.status(401).send("Access denied.");
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as CustomRequest).user = decoded;
    next();
  } catch (err) {
    res.status(400).send("Invalid token.");
  }
};

router.get("/dashboard", verifyToken, async (req, res: any) => {
  try {
    const userId = (req as CustomRequest).user.userId;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
