
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {

    const { user } = useAuth();
    const location = useLocation();

    const roleRoutes = {
        ADMIN: "/admin",
        TECHNICIAN: "/technician",
        EMPLOYEE: "/employee"
    };

    // User is not authenticated
    if (!user) {
        return (
            <Navigate
                to="/"
                replace
                state={{ from: location }}
            />
        );
    }

    // User does not have permission for this route
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <Navigate
                to={roleRoutes[user.role] || "/"}
                replace
            />
        );
    }

    // Authorized user
    return <Outlet />;
}
