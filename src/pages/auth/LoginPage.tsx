import AuthLayout from "../../layouts/AuthLayout";
import Brand from "../../components/common/Brand";

export default function LoginPage() {
    return (
        <AuthLayout>

            <div className="
                min-h-screen
                flex
                items-center
                justify-center
                px-6
            ">

                <div className="
                    bg-white
                    rounded-2xl
                    shadow-xl
                    w-full
                    max-w-md
                    p-10
                ">

                    <Brand />

                    <div className="mt-10">

                        <h2 className="
                            text-2xl
                            font-semibold
                        ">
                            Sign in
                        </h2>

                        <p className="
                            text-slate-500
                            mt-2
                        ">
                            Sign in to continue to VERITAS
                        </p>

                    </div>

                </div>

            </div>

        </AuthLayout>
    );
}