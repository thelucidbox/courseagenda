import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ReplitUser {
  id: number;
  username: string;
  email: string;
  name?: string;
  profileImage?: string;
  createdAt: string;
}

export function useReplitAuth() {
  const { 
    data: user, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: "include"
        });
        
        if (response.status === 401) {
          return null;
        }
        
        if (!response.ok) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (err) {
        console.error("Auth error:", err);
        return null;
      }
    },
    retry: false
  });

  return {
    user,
    isLoading,
    isError,
    error,
    isAuthenticated: !!user,
    
    login: () => {
      window.location.href = '/api/auth/replit';
    },
    
    logout: async () => {
      // Redirect to the auth logout endpoint
      window.location.href = '/api/auth/logout';
    }
  };
}