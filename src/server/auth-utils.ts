/**
 * Centralized JWT authentication utilities
 * Handles JWT token verification and extraction for both OAuth and JWT-based users
 */

import jwt from "jsonwebtoken";

// JWT payload type - represents the data encoded in the JWT token
export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  userType: string;
}

// User context type - unified representation of authenticated users (JWT or OAuth)
export interface AuthenticatedUser {
  id: string;
  type: "oauth" | "jwt"; // Indicates whether user authenticated via NextAuth (oauth) or JWT
}

// Get JWT secret from environment or use default
// In production, always ensure JWT_SECRET is set in your environment variables
export const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || "+8APs0PI/xDA6v42wSxTcS++8hdIC6/5r1taMlGaq/I=";
};

/**
 * Extract JWT token from request headers
 * Supports two formats:
 * 1. Authorization header: "Bearer <token>"
 * 2. Cookie: token=<token>
 */
export const extractTokenFromHeaders = (headers: Headers): string | null => {
  // Check Authorization header first (preferred method)
  const authHeader = headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Fallback to cookie-based token
  const cookieHeader = headers.get("cookie") || "";
  const cookies = parseCookies(cookieHeader);
  return cookies.token || null;
};

/**
 * Simple cookie parser
 * Parses "key1=value1; key2=value2" format cookies
 */
const parseCookies = (cookieHeader: string): Record<string, string> => {
  return Object.fromEntries(
    cookieHeader
      .split("; ")
      .map((c) => c.split("="))
      .filter((parts) => parts.length === 2) as [string, string][]
  );
};

/**
 * Verify and decode JWT token
 * Returns decoded payload on success, null on failure (invalid or expired token)
 */
export const verifyJwtToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error instanceof Error ? error.message : error);
    return null;
  }
};

/**
 * Get user from JWT token extracted from headers
 * This is the main function used in context creation
 * Returns user info with type="jwt" on success, null if no valid token found
 */
export const getUserFromJwtToken = (headers: Headers): AuthenticatedUser | null => {
  const token = extractTokenFromHeaders(headers);
  if (!token) return null;

  const payload = verifyJwtToken(token);
  if (!payload) return null;

  return {
    id: payload.userId,
    type: "jwt",
  };
};
