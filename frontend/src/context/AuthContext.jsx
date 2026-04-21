import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, logoutUser, getMyProfile } from "../api/auth.api";
import { useRef } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(null);

  // Load user on app start
  const loadUser = async () => {
    if (loadingRef.current) return; // ⛔ prevent parallel calls
    loadingRef.current = true;
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setUser(null);
      setLoading(false);
      loadingRef.current = false;
      return;
    }

    try {
      const profile = await getMyProfile();
      setUser(profile);
    } catch {
      localStorage.removeItem("accessToken");
      setUser(null);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (credentials) => {
    const { accessToken } = await loginUser(credentials);
    localStorage.setItem("accessToken", accessToken);
    await loadUser();
  };

  const logout = async () => {
    await logoutUser();
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
