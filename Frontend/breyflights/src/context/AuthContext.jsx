import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const api="http://localhost:5000";
export const AuthProvider = ({ children }) => {
  const [user, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar sesión activa al cargar la app
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("AuthContext: API URL:", api);
        const url = `${api}/api/users/check`;
        console.log("AuthContext: Checking session at URL:", url);
        const resp = await fetch(url, {
          credentials: "include",
        });
        console.log("AuthContext: Check response status:", resp.status);
        console.log("AuthContext: Response ok:", resp.ok);

        if (!resp.ok) {
          const text = await resp.text();
          console.error("AuthContext: Response not ok, body:", text);
          throw new Error("Sesión no válida");
        }
        const data = await resp.json();
        console.log("AuthContext: Session valid, user:", data.user);
        setUsuario(data.user);
      } catch (err) {
        console.error("AuthContext: Session check failed:", err);
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = (userData) => {
    setUsuario(userData);
  };

  const logout = async () => {
    console.log("Frontend logout: Calling backend logout");
    try {
      const resp = await fetch(`${api}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
      console.log("Frontend logout: Backend response status:", resp.status);
      const data = await resp.json();
      console.log("Frontend logout: Response data:", data);
    } catch (err) {
      console.error("Frontend logout: Error calling logout:", err);
    }
    console.log("Frontend logout: Setting usuario to null");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
