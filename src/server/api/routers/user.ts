import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { TRPCError } from "@trpc/server";

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

export const authRouter = createTRPCRouter({
  register: publicProcedure
  .input(z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
  }))
  .mutation(async ({ ctx, input }) => {
    const existingUser = await ctx.db.query.users.findFirst({
      where: eq(users.email, input.email),
    });

    if (existingUser) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const [newUser] = await ctx.db.insert(users).values({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      confirmed: 0,
      confirmationCode,
      userType: 'jwt'
    }).returning();

    // Send confirmation email
    await transporter.sendMail({
      from: `"UpMarket" <${EMAIL_USER}>`,
      to: input.email,
      subject: "Confirm your Email",
      text: `Your confirmation code is: ${confirmationCode}`,
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser?.id,
        email: newUser?.email,
        name: newUser?.name,
        userType: 'jwt'
      }, 
      JWT_SECRET, 
    );

    return { 
      token,
      user: {
        id: newUser?.id,
        name: newUser?.name,
        email: newUser?.email,
        userType: 'jwt'
      },
      message: "Please check your email for confirmation code"
    };
  }),

  confirmEmail: publicProcedure
    .input(z.object({
      email: z.string().email(),
      confirmationCode: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (user.confirmed) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email already confirmed",
        });
      }

      if (user.confirmationCode !== input.confirmationCode) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid confirmation code",
        });
      }

      await ctx.db.update(users)
        .set({ confirmed: 1 })
        .where(eq(users.email, input.email));

      const token = jwt.sign(
        { userId: user.id }, 
        JWT_SECRET
      );
      return { token };
    }),

    login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (!user || user.userType !== 'jwt') {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid credentials",
        });
      }

      if (!user.confirmed) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please confirm your email before logging in",
        });
      }

      const isMatch = await bcrypt.compare(input.password, user.password || '');
      if (!isMatch) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          name: user.name,
          userType: 'jwt'
        }, 
        JWT_SECRET, 
      );

      return { 
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: 'jwt'
        }
      };
    }),

    getUser: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const decoded = jwt.verify(input.token, JWT_SECRET) as { 
          userId: string;
          email: string;
          name: string;
          userType: string;
          exp?: number;
        };
        
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.id, decoded.userId),
        });
  
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }
  
        const tokenExp = decoded.exp ? decoded.exp * 1000 : 0;
        const fiveMinutes = 5 * 60 * 1000;
        
        if (tokenExp - Date.now() < fiveMinutes) {
          const newToken = jwt.sign(
            { 
              userId: user.id,
              email: user.email,
              name: user.name,
              userType: 'jwt'
            }, 
            JWT_SECRET, 
            { expiresIn: "1h" }
          );
  
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            newToken
          };
        }
  
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType
        };
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid token",
        });
      }
    }),
});