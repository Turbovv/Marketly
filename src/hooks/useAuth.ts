import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '~/trpc/react';
import { TRPCClientError } from '@trpc/client';

export interface JWTUser {
    id: string;
    name: string;
    email: string;
    userType: string;
    image?: string;
  }
  
  export interface NextAuthUser {
    id: string;
    name: string | null;
    email: string;
    image?: string;
  }
  
  export const useAuth = () => {
    const { data: nextAuthSession } = useSession();
    const [jwtUser, setJwtUser] = useState<JWTUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);
  
    useEffect(() => {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
    }, []);
  
    const { data: userData, error }: any = api.user.getUser.useQuery(
      { token: token || '' },
      { 
        enabled: !!token,
            retry: false
        }
    );

    useEffect(() => {
        if (error instanceof TRPCClientError) {
            if (error.message === 'Invalid token' || error.message.includes('expired')) {
            localStorage.removeItem('token');
            setJwtUser(null);
            setIsAuthenticated(false);
            window.location.href = '/login';
          }
        }
      }, [error]
    );
  
    useEffect(() => {
      if (userData) {
        setJwtUser(userData);
        setIsAuthenticated(true);
        
        if (userData.newToken) {
          localStorage.setItem('token', userData.newToken);
          setToken(userData.newToken);
        }
      } else if (nextAuthSession?.user) {
        setIsAuthenticated(true);
      }
    }, [userData, nextAuthSession]);
  
  const authUser = nextAuthSession?.user
    ? {
        id: nextAuthSession.user.id || "",
        name: nextAuthSession.user.name || "Guest",
        email: nextAuthSession.user.email || "",
        image: nextAuthSession.user.image || "/user-male.svg", 
        userType: "next-auth",
      }
    : jwtUser
    ? {
        id: jwtUser.id,
        name: jwtUser.name,
        email: jwtUser.email,
        image: jwtUser.image || "/user-male.svg",
        userType: "jwt",
      }
    : null;
  
    return {
      isAuthenticated,
      userId: authUser?.id,
    authUser,
    userType: authUser?.userType,
    };
  };