import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "../auth/AuthContext";
import ProtectedRoute from "../auth/ProtectedRoute";
import LoginPage from "../../pages/auth/LoginPage";
import StudentDashboardPage from "../../pages/student/StudentDashboardPage";
import FacultyDashboardPage from "../../pages/faculty/FacultyDashboardPage";
import HodDashboardPage from "../../pages/hod/HodDashboardPage";

export default function AppRouter() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LoginPage />} />

                    <Route
                        path="/student"
                        element={
                            <ProtectedRoute allowedRoles={["Student"]}>
                                <StudentDashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/faculty"
                        element={
                            <ProtectedRoute allowedRoles={["Faculty", "HOD"]}>
                                <FacultyDashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/hod"
                        element={
                            <ProtectedRoute allowedRoles={["HOD", "Admin"]}>
                                <HodDashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
