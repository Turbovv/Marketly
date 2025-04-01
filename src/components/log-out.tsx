import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
export default function LogOutButton() {
const { authUser } = useAuth();
const router = useRouter();

    const handleLogout = () => {
        if (authUser?.userType === "jwt") {
            localStorage.removeItem("token");
            router.push("/");
        } else if (authUser?.userType === "next-auth") {
            router.push("/api/auth/signout");
        }
    };
    return (
        <div>
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
            >
                <LogOut size={20} />
                <span>Log out</span>
            </button>
        </div>
    )
}
