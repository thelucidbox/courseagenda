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
        const response = await apiRequest<ReplitUser>('/api/auth/user');
        return response;
      } catch (err) {
        if (err.status === 401) {
          return null;
        }
        throw err;
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
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    }
  };
}