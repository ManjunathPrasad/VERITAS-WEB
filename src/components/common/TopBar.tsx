import { useNavigate } from "react-router-dom";
import Brand from "./Brand";
import { useAuth } from "../../app/auth/useAuth";

export default function TopBar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <Brand />

            <div className="flex items-center gap-4">
                {user && (
                    <div className="text-right">
                        <p className="font-medium text-slate-800">
                            {user.fullName}
                        </p>
                        <p className="text-sm text-slate-500">{user.role}</p>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium"
                >
                    Sign out
                </button>
            </div>
        </div>
    );
}
