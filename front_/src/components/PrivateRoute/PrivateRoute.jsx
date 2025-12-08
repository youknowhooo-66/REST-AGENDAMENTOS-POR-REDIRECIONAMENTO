import { Navigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth(); // Destructure loading from useAuth()

    if (loading) {
        return null; // Or a loading spinner, but AuthProvider already handles global loading.
    }

    if (!user) {
        return <Navigate to='/login' replace />; // Redirect to /login, not '/' for authenticated routes
    }

    return children;
}

export default PrivateRoute