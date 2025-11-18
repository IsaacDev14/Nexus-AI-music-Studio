import { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";

// Types based on your database models
export interface User {
  id: number;
  name: string;
  email: string;
  skill_level: string;
  instruments: Instrument[];
  settings?: UserSettings;
  created_at: string;
  updated_at: string;
}

export interface Instrument {
  id: number;
  name: string;
  type: string;
}

export interface UserSettings {
  id: number;
  user_id: number;
  tuning_reference: string;
  preferred_metronome_tempo: number;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
  skill_level: string;
  instruments: number[];
  settings: {
    tuning_reference: string;
    preferred_metronome_tempo: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignUpCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedToken = localStorage.getItem("authToken");
      if (storedToken) {
        try {
          await fetchCurrentUser(storedToken);
        } catch {
          localStorage.removeItem("authToken");
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const fetchCurrentUser = async (authToken: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!res.ok) throw new Error("Failed to fetch user");

    const data: User = await res.json();
    setUser(data);
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");

      localStorage.setItem("authToken", data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: SignUpCredentials): Promise<void> => {
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Signup failed");

      localStorage.setItem("authToken", data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) setUser({ ...user, ...userData });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, signup, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
