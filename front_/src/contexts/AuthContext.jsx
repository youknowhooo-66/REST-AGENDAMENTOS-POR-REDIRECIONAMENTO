import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ✅ Inicializa usuário com base no token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("Token inválido:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  // ✅ Login
  const login = (token) => {
    try {
      const decoded = jwtDecode(token);
      localStorage.setItem("token", token);
      setUser(decoded);
      toast.success("Login realizado com sucesso!", {
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch {
      toast.error("Token inválido ao fazer login.");
    }
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.info("Logout realizado com sucesso!", {
      autoClose: 2500,
      hideProgressBar: true,
      pauseOnHover: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado
export const useAuth = () => useContext(AuthContext);
