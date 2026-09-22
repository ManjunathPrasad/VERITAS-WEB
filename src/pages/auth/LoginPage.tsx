import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Brand from "../../components/common/Brand";
import ErrorBanner from "../../components/common/ErrorBanner";
import { useAuth } from "../../app/auth/useAuth";
import { ApiError } from "../../lib/api/client";
import type { Role } from "../../lib/api/types";

const ROLE_HOME: Record<Role, string> = {
    Student: "/student",
    Faculty: "/faculty",
    HOD: "/hod",
    Admin: "/hod",
};

export default function LoginPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (user) {
        return <Navigate to={ROLE_HOME[user.role]} replace />;
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const response = await login(email, password);
            navigate(ROLE_HOME[response.role]);
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? "Invalid email or password."
                    : "Could not reach the server. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout>
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10">
                    <Brand />

                    <div className="mt-10">
                        <h2 className="text-2xl font-semibold">Sign in</h2>
                        <p className="text-slate-500 mt-2">
                            Sign in to continue to VERITAS
                        </p>
                    </div>

                    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                        <ErrorBanner message={error} />

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                autoComplete="username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800"
                                placeholder="you@veritas.local"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-blue-800 hover:bg-blue-900 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 transition"
                        >
                            {submitting ? "Signing in…" : "Sign in"}
                        </button>
                    </form>
                </div>
            </div>
        </AuthLayout>
    );
}
