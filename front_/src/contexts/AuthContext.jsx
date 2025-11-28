import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

// Module-level variable to hold the logout function for the API interceptor
export let apiInterceptorLogout = () => { // Changed to 'export let'
  console.warn("Logout function not set in API interceptor yet.");
  localStorage.removeItem("token");
  window.location.href = '/login';
};

export const setApiInterceptorLogout = (logoutFn) => {
  apiInterceptorLogout = logoutFn;
};

export const AuthContext = createContext(); // Changed to 'export const'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Inicializa usuário com base no token e verifica expiração
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // current time in seconds

        if (decoded.exp < currentTime) {
          // Token has expired
          console.error("Token expirado.");
          localStorage.removeItem("token");
          setUser(null);
          toast.info("Sua sessão expirou. Por favor, faça login novamente.", {
            autoClose: 3000,
            hideProgressBar: true,
          });
          apiInterceptorLogout(); // Force logout in case any API calls were pending
        } else {
          setUser(decoded);
        }
      } catch (error) {
        console.error("Token inválido:", error);
        localStorage.removeItem("token");
        setUser(null);
        apiInterceptorLogout(); // Force logout for invalid tokens too
      }
    }
  }, []);

  // Login
  const login = (token) => {
    try {
      const decoded = jwtDecode(token);
      localStorage.setItem("token", token);
      setUser(decoded);
      toast.success("Login realizado com sucesso!", {
        autoClose: 2000,
        hideProgressBar: true,
      });

      // Redirect based on role
      if (decoded.role === 'PROVIDER') {
        window.location.href = '/dashboard'; // Redirect to provider dashboard
      } else if (decoded.role === 'CLIENT') {
        window.location.href = '/client/booking'; // Redirect to client booking page
      } else {
        window.location.href = '/'; // Default redirect
      }
    } catch {
      toast.error("Token inválido ao fazer login.");
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.info("Logout realizado com sucesso!", {
      autoClose: 2500,
      hideProgressBar: true,
      pauseOnHover: false,
    });
    apiInterceptorLogout(); // Also trigger interceptor logout to clear any state
  };

  // Register the logout function with the api module
  useEffect(() => {
    setApiInterceptorLogout(() => {
      logout();
      // Optionally, redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    });
  }, [logout]);


  return (
    <AuthContext.Provider
      value={{
        user,
        setUser, // Also expose setUser for direct updates like in UserProfile
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
