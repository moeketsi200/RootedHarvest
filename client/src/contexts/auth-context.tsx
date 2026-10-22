import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  userType: "farmer" | "buyer";
  location?: string | null;
  emailVerified: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  userType: "farmer" | "buyer";
  location?: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  userProfile: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  register: (data: RegisterData) => Promise<AuthUser>;
  verifyEmail: (code: string, email?: string) => Promise<AuthUser>;
  resendVerification: (email?: string) => Promise<{ message: string; code?: string }>;
  toggleVerificationTest: () => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  // Fetch current session from our local SQLite backend
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.status === 401) {
          return null;
        }
        if (!res.ok) {
          return null;
        }
        return await res.json();
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return (await res.json()) as AuthUser;
    },
    onSuccess: (newUser) => {
      queryClient.setQueryData(["/api/auth/me"], newUser);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      return (await res.json()) as AuthUser;
    },
    onSuccess: (newUser) => {
      queryClient.setQueryData(["/api/auth/me"], newUser);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
      window.location.href = "/";
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async ({ code, email }: { code: string; email?: string }) => {
      const res = await apiRequest("POST", "/api/auth/verify-email", { code, email });
      const data = await res.json();
      return data.user as AuthUser;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/auth/me"], updatedUser);
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: async (email?: string) => {
      const res = await apiRequest("POST", "/api/auth/resend-verification", { email });
      return await res.json();
    },
  });

  const toggleVerificationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/toggle-verification-test");
      const data = await res.json();
      return data.user as AuthUser;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/auth/me"], updatedUser);
    },
  });

  const value: AuthContextType = {
    currentUser: user || null,
    userProfile: user || null,
    loading: isLoading,
    login: async (credentials: LoginCredentials) => {
      return await loginMutation.mutateAsync(credentials);
    },
    register: async (data: RegisterData) => {
      return await registerMutation.mutateAsync(data);
    },
    verifyEmail: async (code: string, email?: string) => {
      return await verifyEmailMutation.mutateAsync({ code, email });
    },
    resendVerification: async (email?: string) => {
      return await resendVerificationMutation.mutateAsync(email);
    },
    toggleVerificationTest: async () => {
      return await toggleVerificationMutation.mutateAsync();
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}