"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/trpc/react";
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";

export default function LogOutButton() {
    const { authUser } = useAuth();
    const router = useRouter();
    const utils = api.useContext();

    const handleLogout = async () => {
        if (!authUser) return;

        if (authUser.userType === "jwt") {
            Cookies.remove("token", { path: "/" });
        } else {
            await signOut({ redirect: false });
        }
        window.location.href = "/";
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
        >
            <LogOut size={20} />
            <span>Log out</span>
        </button>
    )
}
