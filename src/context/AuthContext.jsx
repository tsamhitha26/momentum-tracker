import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);    // { id, username }
  const [token, setToken] = useState(null);  // JWT
  const [loading, setLoading] = useState(true);

  // Restore authentication from localStorage on first load
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("auth_user");
      const savedToken = localStorage.getItem("auth_token");

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch (err) {
      console.warn("Failed to parse auth_user:", err);
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    }

    setLoading(false);
  }, []);

  /**
   * LOGIN (used by Login.jsx after calling API)
   */
  const login = (userObj, jwtToken) => {
    setUser(userObj);
    setToken(jwtToken);

    localStorage.setItem("auth_user", JSON.stringify(userObj));
    localStorage.setItem("auth_token", jwtToken);
  };

  /**
   * LOGOUT (clears everything)
   */
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
