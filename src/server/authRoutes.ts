import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./db/schema";

interface CustomRequest extends express.Request {
  user?: any;
}

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "+8APs0PI/xDA6v42wSxTcS++8hdIC6/5r1taMlGaq/I=";
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer transport error:", error);
  } else {
    console.log("Server is ready to send emails");
  }
});

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
    const confirmationCode = (Math.floor(100000 + Math.random() * 900000)).toString();

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
        confirmed: 0,
        confirmationCode,
      });
  
      try {
        await transporter.sendMail({
          from: `"UpMarket" <${EMAIL_USER}>`,
          to: email,
          subject: "Confirm your Email",
          text: `Your confirmation code is: ${confirmationCode}`,
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        return res.status(500).json({ message: "Error sending confirmation email." });
      }
      
      res.status(201).json({ message: "User registered. Check your email for confirmation code." });
    } catch (error: any) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

router.post("/confirm-email", async (req, res: any) => {
  const { email, confirmationCode } = req.body;

  try {
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.confirmed) {
      return res.status(400).json({ message: "Email already confirmed" });
    }

    if (user.confirmationCode !== confirmationCode) {
      return res.status(400).json({ message: "Invalid confirmation code" });
    }

    await db.update(users).set({ confirmed: 1 }).where(eq(users.email, email));

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Email confirmed successfully",
      token,
    });
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
    if (!user.confirmed) {
      return res.status(400).json({ message: "Please confirm your email before logging in." });
    }
    if (!user.password) {
      return res.status(400).json({ message: "Invalid password" });
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
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});
router.post("/logout", verifyToken, async (req, res: any) => {
  try {
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out" });
  }
});
export default router;
