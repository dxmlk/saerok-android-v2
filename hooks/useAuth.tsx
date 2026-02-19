import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "expo-router";

import {
  getAccessToken,
  removeAccessToken,
  clearTokens,
} from "../lib/tokenStore";
import { getUserInfo } from "../services/api/user";
import { onAuthExpired } from "../services/authEvents";

export interface User {
  nickname: string;
  email: string;
  joinedDate: string;
  profileImageUrl: string | null;
  thumbnailImageUrl: string | null;
}

interface AuthContextProps {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  refreshUser: (opts?: { silent?: boolean }) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setUser(null);
        return false;
      }

      const info = await getUserInfo();
      setUser(info as any);
      return true;
    } catch {
      setUser(null);
      return false;
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const off = onAuthExpired(async () => {
      await clearTokens();
      setUser(null);
      router.replace("/login");
    });
    return off;
  }, [router]);

  const logout = useCallback(async () => {
    await removeAccessToken();
    setUser(null);
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!user,
        user,
        loading,
        refreshUser,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
