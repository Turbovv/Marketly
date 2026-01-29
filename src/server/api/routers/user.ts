import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import { parse } from "cookie";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "134c8571e17ee7d8d06db23af81d700b8c1437e732b089b67c4a59612ea8e25cab7cea0183060231f3d24e38401f2b1925229859e3107ea631397a1b676b2119ff2766bfd9e04b50cb680051578a8481eee0167efa60ec6431a8d9bee1941180fb322161dfeae68b65e1e165040651a5dc6383fd79108d4d2622c796d66943a13acf7ba227922f1c27b3c0986131384e3cc991f6c2c7d7b083aa01e82bfa39b4f363f641d1b58e5b972824660a6ff0af157fc0ab4e1d031b5002a60304c140ad8ffa9cb33cefd3232ee278ac08173f2823cb69976b5b90551991ba52493eb3976f6f3f0ec00ac0cc2ff2371a26985455309e209ef4826c3b322ce7438b6c0679";
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
        JWT_SECRET,
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
        const decoded = jwt.verify(input.token, JWT_SECRET) as {
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
          JWT_SECRET,
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
        JWT_SECRET,
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
      let token: string | null = null;

      const authHeader =
        ctx.headers.get("authorization") || ctx.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) token = authHeader.substring(7);

      if (!token) {
        const cookies = parse(ctx.headers.get("cookie") || "");
        token = cookies.token || null;
      }

      if (!token)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No token found",
        });

      const decoded = jwt.verify(token, JWT_SECRET) as {
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
        JWT_SECRET,
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
        const decoded = jwt.verify(input.token, JWT_SECRET) as {
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
        const decoded = jwt.verify(input.token, JWT_SECRET) as {
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
