import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import { getJwtSecret, extractTokenFromHeaders } from "~/server/auth-utils";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});
const CONFIRMATION_CODE_LENGTH = 6;

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
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
      const confirmationCode = Array.from(
        { length: CONFIRMATION_CODE_LENGTH },
        () => Math.floor(Math.random() * 10),
      ).join("");

      const token = jwt.sign(
        {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          confirmationCode,
          userType: "jwt",
        },
        getJwtSecret(),
        // { expiresIn: '15m' }
      );

      await transporter.sendMail({
        from: `"UpMarket" <${EMAIL_USER}>`,
        to: input.email,
        subject: "Confirm your Email",
        text: `Your confirmation code is: ${confirmationCode}`,
      });

      return {
        token,
        message: "Please check your email for confirmation code",
      };
    }),

  confirmEmail: publicProcedure
    .input(
      z.object({
        confirmationCode: z.string(),
        token: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const decoded = jwt.verify(input.token, getJwtSecret()) as {
          name: string;
          email: string;
          password: string;
          confirmationCode: string;
          userType: string;
        };

        if (decoded.confirmationCode !== input.confirmationCode) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid confirmation code",
          });
        }
        const rawUsername = decoded.email?.split("@")[0];
        if (!rawUsername) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Username generation failed",
          });
        }
        const [newUser] = await ctx.db
          .insert(users)
          .values({
            name: decoded.name,
            email: decoded.email,
            password: decoded.password,
            username: rawUsername,
            confirmed: 1,
            userType: "jwt",
          })
          .returning();

        const authToken = jwt.sign(
          {
            userId: newUser?.id,
            email: newUser?.email,
            name: newUser?.name,
            userType: "jwt",
          },
          getJwtSecret(),
        );

        return { message: "Email confirmed", token: authToken };
      } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid or expired token. Please register again.",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (!user || user.userType !== "jwt") {
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

      const isMatch = await bcrypt.compare(input.password, user.password || "");
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
          userType: "jwt",
        },
        getJwtSecret(),
      );

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: "jwt",
        },
      };
    }),

  getUser: publicProcedure.query(async ({ ctx }) => {
    if (ctx.session?.user) {
      return {
        id: ctx.session.user.id,
        name: ctx.session.user.name || "Guest",
        email: ctx.session.user.email,
        userType: "next-auth",
        image: ctx.session.user.image || "/user-male.svg",
      };
    }

    try {
      const token = extractTokenFromHeaders(ctx.headers);

      if (!token)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No token found",
        });

      const decoded = jwt.verify(token, getJwtSecret()) as {
        userId: string;
        email: string;
        name: string;
        userType: string;
      };

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, decoded.userId),
      });
      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      };
    } catch (error) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
    }
  }),

  logout: publicProcedure.mutation(async () => {
    return {
      success: true,
      message: "Logged out successfully",
    };
  }),
  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (!user) {
        return { message: "If this email exists, a reset code has been sent." };
      }

      const resetCode = crypto.randomInt(100000, 999999).toString();
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          resetCode,
        },
        getJwtSecret(),
        { expiresIn: "15m" },
      );

      await transporter.sendMail({
        from: `"UpMarket" <${EMAIL_USER}>`,
        to: user.email,
        subject: "Password Reset Code",
        text: `Your password reset code is: ${resetCode}`,
      });

      return {
        token,
        message: "If this email exists, a reset code has been sent.",
      };
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        resetCode: z.string(),
        newPassword: z.string().min(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const decoded = jwt.verify(input.token, getJwtSecret()) as {
          userId: string;
          resetCode: string;
        };

        if (decoded.resetCode !== input.resetCode) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid reset code",
          });
        }

        const hashedPassword = await bcrypt.hash(input.newPassword, 10);

        await ctx.db
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, decoded.userId));

        return { message: "Password reset successful" };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired token",
        });
      }
    }),
  validateResetCode: publicProcedure
    .input(
      z.object({
        token: z.string(),
        resetCode: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const decoded = jwt.verify(input.token, getJwtSecret()) as {
          resetCode: string;
        };

        if (decoded.resetCode !== input.resetCode) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid reset code",
          });
        }

        return { message: "Code is valid" };
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired token",
        });
      }
    }),
});
