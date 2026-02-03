import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getAccessToken, removeAccessToken } from "../lib/tokenStore";
import { getUserInfo } from "../services/api/user";

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
  refreshUser: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      console.log("[Auth] token:", token ? "EXISTS" : "NULL");
      if (!token) {
        setUser(null);
        return false;
      }
      const info = await getUserInfo();
      setUser(info);
      return true;
    } catch {
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = useCallback(async () => {
    await removeAccessToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn: !!user, user, loading, refreshUser, logout }}
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
