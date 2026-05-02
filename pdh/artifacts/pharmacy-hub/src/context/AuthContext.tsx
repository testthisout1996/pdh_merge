import * as React from "react";

export type Role = "superadmin" | "admin" | "basic";

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: { username: string; pin: string }) => Promise<{ error?: string }>;
  konamiLogin: () => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  loginModalOpen: boolean;
  openLoginModal: (postLoginPath?: string) => void;
  closeLoginModal: () => void;
  postLoginPath: string | null;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);
  const [postLoginPath, setPostLoginPath] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const openLoginModal = React.useCallback((path?: string) => {
    setPostLoginPath(path ?? null);
    setLoginModalOpen(true);
  }, []);

  const closeLoginModal = React.useCallback(() => {
    setLoginModalOpen(false);
    setPostLoginPath(null);
  }, []);

  const login = React.useCallback(
    async (credentials: { username: string; pin: string }): Promise<{ error?: string }> => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });
        const data = await res.json();
        if (!res.ok) {
          return { error: data.error ?? "Login failed" };
        }
        setUser(data);
        setLoginModalOpen(false);
        return {};
      } catch {
        return { error: "Network error. Please try again." };
      }
    },
    []
  );

  const konamiLogin = React.useCallback(async (): Promise<{ error?: string }> => {
    try {
      const res = await fetch("/api/auth/konami", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error ?? "Login failed" };
      }
      setUser(data);
      setLoginModalOpen(false);
      return {};
    } catch {
      return { error: "Network error. Please try again." };
    }
  }, []);

  const logout = React.useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        konamiLogin,
        logout,
        refresh,
        loginModalOpen,
        openLoginModal,
        closeLoginModal,
        postLoginPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
