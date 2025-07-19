import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  // Check for existing session on app load
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (userData?.user) {
      setUser(userData.user);
    } else if (error) {
      // Clear any stale user data if the session is invalid
      setUser(null);
    }
  }, [userData, error]);

  const login = (userData: User) => {
    setUser(userData);
    // Invalidate and refetch user data to ensure consistency
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
  };

  const logout = () => {
    setUser(null);
    // Clear all cached data on logout
    queryClient.clear();
    // Redirect to home page
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook for protected routes
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to auth page if not authenticated
      window.location.href = "/auth";
    }
  }, [user, isLoading]);

  return { user, isLoading };
}

// Hook for checking if user is authenticated without redirecting
export function useAuthState() {
  const { user, isLoading } = useAuth();
  return {
    isAuthenticated: !!user,
    user,
    isLoading,
  };
}
