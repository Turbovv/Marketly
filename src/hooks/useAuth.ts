"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import Cookies from "js-cookie";
import { TRPCClientError } from "@trpc/client";

export interface JWTUser {
  id: string;
  name: string;
  email: string;
  userType: "jwt";
  image?: string;
}

export interface NextAuthUser {
  id: string;
  name: string;
  email: string;
  userType: "next-auth";
  image?: string;
}

export const useAuth = () => {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const [jwtUser, setJwtUser] = useState<JWTUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);

  const { data: userData, error }: any = api.user.getUser.useQuery(undefined, { retry: false });

  useEffect(() => {
    if (error instanceof TRPCClientError) {
      setJwtUser(null);
      setIsAuthenticated(false);
      setChecked(true);
    }
  }, [error]);

  useEffect(() => {
    if (userData) {
      setJwtUser(userData);
      setIsAuthenticated(true);
      if (userData.newToken) {
        Cookies.set("token", userData.newToken, { expires: 7, sameSite: "lax", path: "/" });
      }
      setChecked(true);
    } else if (nextAuthSession?.user) {
      setIsAuthenticated(true);
      setChecked(true);
    } else if (nextAuthStatus !== "loading") {
      setIsAuthenticated(false);
      setChecked(true);
    }
  }, [userData, nextAuthSession, nextAuthStatus]);

  const authUser = nextAuthSession?.user
    ? {
        id: nextAuthSession.user.id || "",
        name: nextAuthSession.user.name || "Guest",
        email: nextAuthSession.user.email || "",
        image: nextAuthSession.user.image || "/user-male.svg",
        userType: "next-auth" as const,
      }
    : jwtUser
    ? {
        id: jwtUser.id,
        name: jwtUser.name,
        email: jwtUser.email,
        image: jwtUser.image || "/user-male.svg",
        userType: "jwt" as const,
      }
    : null;

  return {
    isAuthenticated,
    authUser,
    userType: authUser?.userType,
    userId: authUser?.id,
    isLoading: nextAuthStatus === "loading" || !checked,
  };
};
