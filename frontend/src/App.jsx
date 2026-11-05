
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import ReportIncident from "./pages/ReportIncident";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>

                    {/* Public routes */}
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Employee routes */}
                    <Route element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
                        <Route
                            path="/employee"
                            element={<EmployeeDashboard />}
                        />
                        <Route
                            path="/employee/report"
                            element={<ReportIncident />}
                        />
                    </Route>

                    {/* Technician routes */}
                    <Route element={<ProtectedRoute allowedRoles={["TECHNICIAN"]} />}>
                        <Route
                            path="/technician"
                            element={<TechnicianDashboard />}
                        />
                    </Route>

                    {/* Administrator routes */}
                    <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                        <Route
                            path="/admin"
                            element={<AdminDashboard />}
                        />
                    </Route>

                    {/* Profile route - accessible to all authenticated roles */}
                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={["EMPLOYEE", "TECHNICIAN", "ADMIN"]}
                            />
                        }
                    >
                        <Route path="/profile" element={<Profile />} />
                    </Route>

                    {/* Unknown routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
