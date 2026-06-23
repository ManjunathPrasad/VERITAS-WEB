import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../../pages/auth/LoginPage";
import StudentDashboardPage from "../../pages/student/StudentDashboardPage";
import FacultyDashboardPage from "../../pages/faculty/FacultyDashboardPage";
import HodDashboardPage from "../../pages/hod/HodDashboardPage";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<LoginPage />}
                />

                <Route
                    path="/student"
                    element={<StudentDashboardPage />}
                />

                <Route
                    path="/faculty"
                    element={<FacultyDashboardPage />}
                />

                <Route
                    path="/hod"
                    element={<HodDashboardPage />}
                />

            </Routes>
        </BrowserRouter>
    );
}