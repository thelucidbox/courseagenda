import { useReplitAuth } from './use-replit-auth';

// This is a compatibility wrapper around useReplitAuth
// It allows existing components to use useAuth() without changes
export function useAuth() {
  const { 
    user, 
    isLoading, 
    isAuthenticated, 
    isError, 
    error,
    login,
    logout 
  } = useReplitAuth();

  return {
    user,
    isAuthenticated,
    isLoading,
    isError,
    error,
    // Alias login as loginWithGoogle for backward compatibility
    loginWithGoogle: login,
    // Also provide the direct login method
    login,
    logout,
    refetch: () => {}, // Empty function for backward compatibility
    isLoggingOut: false // Always false since the Replit auth handles this differently
  };
}