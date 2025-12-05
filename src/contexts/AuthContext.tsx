"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, avatar?: string) => Promise<boolean>;
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

  // 初始化時從 localStorage 讀取 token
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ query: ME_QUERY }),
      });

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
      console.error("獲取用戶信息失敗:", err);
      localStorage.removeItem("auth_token");
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: LOGIN_MUTATION,
          variables: { input: { email, password } },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        setError(result.errors[0].message);
        setIsLoading(false);
        return false;
      }

      const { user: userData, token: authToken } = result.data.login;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem("auth_token", authToken);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError("登入失敗，請稍後再試");
      setIsLoading(false);
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    avatar?: string
  ): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: REGISTER_MUTATION,
          variables: { input: { email, password, name, avatar } },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        setError(result.errors[0].message);
        setIsLoading(false);
        return false;
      }

      const { user: userData, token: authToken } = result.data.register;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem("auth_token", authToken);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError("註冊失敗，請稍後再試");
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
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
