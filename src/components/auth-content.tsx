"use client"
import { useAuth } from '~/hooks/useAuth';
import { useState, useEffect } from 'react';

export default function AuthStatus() {
  const { nextAuthSession, jwtUser } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (!nextAuthSession && !jwtUser) {
    return null;
  }

  return (
    <div className="text-center text-lg">
      {nextAuthSession && <span>Welcome, {nextAuthSession.user?.name}!</span>}
      {jwtUser && <span>Welcome, {jwtUser.name}!</span>}
    </div>
  );
}