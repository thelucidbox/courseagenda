import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  profileImage?: string;
  googleId?: string;
  createdAt: Date;
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/auth/user', { method: 'GET' });
        
        if (!response) {
          return null;
        }
        
        return response as User;
      } catch (error) {
        // If we get a 401, the user is not authenticated
        if (error instanceof Response && error.status === 401) {
          return null;
        }
        
        throw error;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const login = () => {
    // Redirect to Google OAuth flow
    window.location.href = '/api/auth/google';
  };

  const logout = () => {
    // Clear local auth state
    queryClient.setQueryData(['/api/auth/user'], null);
    
    // Redirect to logout endpoint
    window.location.href = '/api/auth/logout';
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
  };
}