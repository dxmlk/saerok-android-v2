import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from "../lib/tokenStore";
import { getUserInfo, User } from "../services/api/user";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthContextValue = {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setTokenAndLoadUser: (token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      const me = await getUserInfo();
      setUser(me);
    } catch (e) {
      // 토큰이 있는데 401이면 토큰이 죽은 것
      console.log("[AuthProvider] refreshUser ERROR", e);
      setUser(null);
      await removeAccessToken();
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await removeAccessToken();
    setUser(null);
  }, []);

  const setTokenAndLoadUser = useCallback(
    async (token: string) => {
      await setAccessToken(token);
      await refreshUser();
    },
    [refreshUser],
  );

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoggedIn: !!user,
      user,
      loading,
      setUser,
      logout,
      refreshUser,
      setTokenAndLoadUser,
    }),
    [user, loading, logout, refreshUser, setTokenAndLoadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth는 AuthProvider 내부에서만 사용 가능합니다.");
  return ctx;
}
