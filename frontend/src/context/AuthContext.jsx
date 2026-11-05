
import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("user");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            return null;
        }
    });

    const [loading] = useState(false);

    const login = async (email, password) => {
        const response = await api.post("/auth/login", {
            email,
            password
        });

        const { accessToken, user: authenticatedUser } = response.data;

        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(authenticatedUser));

        setUser(authenticatedUser);

        return authenticatedUser;
    };

    const register = async (fullName, email, password) => {
        return await api.post("/auth/register", {
            fullName,
            email,
            password
        });
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
