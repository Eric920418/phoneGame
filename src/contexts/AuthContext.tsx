"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

const FETCH_TIMEOUT = 10000; // 10 秒超時

interface User {
  id: number;
  email: string;
  name: string;
  avatar: string | null;
  gameHours: number;
  isVerified: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (email: string, password: string, name: string, avatar?: string) => Promise<User | null>;
  logout: () => void;
  updateUser: (user: User) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
        name
        avatar
        gameHours
        isVerified
        isAdmin
      }
      token
    }
  }
`;

const REGISTER_MUTATION = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        email
        name
        avatar
        gameHours
        isVerified
        isAdmin
      }
      token
    }
  }
`;

const ME_QUERY = `
  query Me {
    me {
      id
      email
      name
      avatar
      gameHours
      isVerified
      isAdmin
    }
  }
`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false); // 防止重複請求

  // 初始化時從 localStorage 讀取 token
  useEffect(() => {
    // 防止重複執行
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (authToken: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ query: ME_QUERY }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();

      if (result.errors) {
        // Token 無效，清除
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
      } else if (result.data?.me) {
        setUser(result.data.me);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        console.error("獲取用戶信息超時");
      } else {
        console.error("獲取用戶信息失敗:", err);
      }
      localStorage.removeItem("auth_token");
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User | null> => {
    setError(null);
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: LOGIN_MUTATION,
          variables: { input: { email, password } },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();

      if (result.errors) {
        setError(result.errors[0].message);
        setIsLoading(false);
        return null;
      }

      const { user: userData, token: authToken } = result.data.login;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem("auth_token", authToken);
      document.cookie = `auth_token=${authToken}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
      setIsLoading(false);
      return userData;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        setError("登入請求超時，請稍後再試");
      } else {
        setError("登入失敗，請稍後再試");
      }
      setIsLoading(false);
      return null;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    avatar?: string
  ): Promise<User | null> => {
    setError(null);
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: REGISTER_MUTATION,
          variables: { input: { email, password, name, avatar } },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();

      if (result.errors) {
        setError(result.errors[0].message);
        setIsLoading(false);
        return null;
      }

      const { user: userData, token: authToken } = result.data.register;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem("auth_token", authToken);
      document.cookie = `auth_token=${authToken}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
      setIsLoading(false);
      return userData;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        setError("註冊請求超時，請稍後再試");
      } else {
        setError("註冊失敗，請稍後再試");
      }
      setIsLoading(false);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    document.cookie = "auth_token=; path=/; max-age=0";
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        register,
        logout,
        updateUser,
        clearError,
      }}
    >
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
