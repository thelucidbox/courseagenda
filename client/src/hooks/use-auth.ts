import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query to get the current authenticated user
  const { 
    data: user, 
    isLoading,
    error,
    isError,
    refetch
  } = useQuery<User | null>({
    queryKey: ['/api/auth/user'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Mutation for logging out
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/auth/logout', { method: 'POST' });
    },
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      // Show success message
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
        variant: 'default',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Function to initiate Google login
  const loginWithGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  // Function to log out
  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    isError,
    error,
    loginWithGoogle,
    logout,
    refetch,
    isLoggingOut: logoutMutation.isPending
  };
}