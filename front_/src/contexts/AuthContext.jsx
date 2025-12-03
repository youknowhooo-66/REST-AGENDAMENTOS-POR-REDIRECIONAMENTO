import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Module-level variable to hold the logout function for the API interceptor
export let apiInterceptorLogout = () => {
  console.warn("Logout function not set in API interceptor yet.");
  localStorage.removeItem("token");
  window.location.href = '/login';
};

export const setApiInterceptorLogout = (logoutFn) => {
  apiInterceptorLogout = logoutFn;
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          console.error("Token expirado.");
          localStorage.removeItem("token");
          setUser(null);
          toast.info("Sua sessão expirou. Por favor, faça login novamente.", {
            autoClose: 3000,
            hideProgressBar: true,
          });
          navigate('/login');
        } else {
          setUser(decoded);
        }
      } catch (error) {
        console.error("Token inválido:", error);
        localStorage.removeItem("token");
        setUser(null);
        navigate('/login');
      }
    }
  }, [navigate]);

  const login = useCallback((token) => {
    try {
      const decoded = jwtDecode(token);
      localStorage.setItem("token", token);
      setUser(decoded);
      // Navigation and toasts are now handled in the component
    } catch {
      toast.error("Token inválido ao fazer login.");
      localStorage.removeItem("token");
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    toast.info("Logout realizado com sucesso!", {
      autoClose: 2500,
      hideProgressBar: true,
      pauseOnHover: false,
    });
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    setApiInterceptorLogout(logout);
  }, [logout]);

  const contextValue = useMemo(() => ({
    user,
    setUser,
    login,
    logout,
  }), [user, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
