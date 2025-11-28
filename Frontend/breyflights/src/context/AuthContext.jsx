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
        const url = `${api}/api/users/check`;
        const resp = await fetch(url, {
          credentials: "include",
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error("Sesión no válida");
        }
        const data = await resp.json();
        setUsuario(data.user);
      } catch (err) {
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
    localStorage.removeItem("cart");
    try {
      const resp = await fetch(`${api}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await resp.json();
    } catch (err) {
      console.error("Frontend logout: Error calling logout:", err);
    }
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
