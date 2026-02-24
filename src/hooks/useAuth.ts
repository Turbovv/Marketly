"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { TRPCClientError } from "@trpc/client";

/**
 * Unified authenticated user type using discriminated union
 * userType field distinguishes between OAuth and JWT authentication methods
 */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image: string;
  userType: "oauth" | "jwt";
};

/**
 * Custom hook for managing dual authentication (OAuth + JWT)
 *
 * Supports two authentication flows:
 * 1. NextAuth with OAuth providers (social login)
 * 2. JWT with email/password registration
 *
 * OAuth takes precedence if both are present.
 *
 * @returns {Object} Authentication state and user data
 * @returns {AuthUser | null} authUser - Current authenticated user or null
 * @returns {string | undefined} userId - Current user's ID
 * @returns {"oauth" | "jwt" | undefined} userType - Authentication method
 * @returns {boolean} isAuthenticated - Whether user is logged in
 * @returns {boolean} isLoading - Whether auth status is being checked
 */
export const useAuth = () => {
  // NextAuth session (OAuth users like GitHub, Google, etc.)
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();

  // JWT user data from API (email/password users)
  const { data: jwtUserData, error: jwtError } = api.user.getUser.useQuery(
    undefined,
    { retry: false },
  );

  // Track when authentication check is complete
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);

  /**
   * Effect: Mark auth check as complete when we have results from both auth methods
   * This prevents rendering before we know the actual auth state
   */
  useEffect(() => {
    const nextAuthLoading = nextAuthStatus === "loading";
    const jwtCheckComplete =
      jwtError instanceof TRPCClientError || !!jwtUserData;

    // Once NextAuth finishes loading and JWT check is done, we're ready
    if (!nextAuthLoading && jwtCheckComplete) {
      setIsAuthCheckComplete(true);
    }
  }, [nextAuthStatus, jwtError, jwtUserData]);

  /**
   * Resolve authenticated user from either authentication method
   * Priority: OAuth (NextAuth) > JWT
   * If user is signed in via OAuth, that takes precedence over JWT
   */
  const authUser: AuthUser | null = resolveAuthUser(
    nextAuthSession,
    jwtUserData,
  );
  const isAuthenticated = !!authUser;
  const isLoading = nextAuthStatus === "loading" || !isAuthCheckComplete;

  return {
    // User information
    authUser,
    userType: authUser?.userType,
    userId: authUser?.id,

    // Status flags
    isAuthenticated,
    isLoading,
  };
};

/**
 * Helper: Resolve which user to use (OAuth or JWT)
 * Returns NextAuth user if present, otherwise JWT user
 */
function resolveAuthUser(
  nextAuthSession: ReturnType<typeof useSession>["data"],
  jwtUserData: any,
): AuthUser | null {
  // Priority 1: NextAuth (OAuth) user
  if (nextAuthSession?.user) {
    return {
      id: nextAuthSession.user.id || "",
      name: nextAuthSession.user.name || "Guest",
      email: nextAuthSession.user.email || "",
      image: nextAuthSession.user.image || "/user-male.svg",
      userType: "oauth",
    };
  }

  // Priority 2: JWT user
  if (jwtUserData) {
    return {
      id: jwtUserData.id,
      name: jwtUserData.name,
      email: jwtUserData.email,
      image: jwtUserData.image || "/user-male.svg",
      userType: "jwt",
    };
  }

  // No user authenticated
  return null;
}
