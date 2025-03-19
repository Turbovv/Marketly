import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '~/trpc/react';

export interface JWTUser {
    id: string;
    name: string;
    email: string;
    userType: string;
  }
  
  export interface NextAuthUser {
    id: string;
    name: string | null;
    email: string;
  }
  export const useAuth = () => {
    const { data: nextAuthSession } = useSession();
    const [jwtUser, setJwtUser] = useState<JWTUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
  
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
      }
    }, []);
  
    const { data: userData } = api.user.getUser.useQuery(
      { token: token || '' },
      { 
        enabled: !!token,
        retry: false
      }
    );
  
    useEffect(() => {
      if (userData) {
        setJwtUser({
          id: userData.id,
          name: userData.name ?? '',
          email: userData.email,
          userType: userData.userType
        });
      }
    }, [userData]);
  
    const isAuthenticated = Boolean(nextAuthSession?.user || jwtUser);
  
    return {
      isAuthenticated,
      userId: jwtUser?.id || nextAuthSession?.user?.id,
      jwtUser,
      nextAuthSession,
    };
  };