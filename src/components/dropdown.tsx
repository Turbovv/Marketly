import { useAuth } from "~/hooks/useAuth";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";
import { ChevronDown, ChevronUp, User, ShoppingCart, Heart, MessageSquare, LogOut } from "lucide-react";
import LogOutButton from "~/components/log-out";
import Link from "next/link";

export function Dropdown() {
    const { authUser} = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="py-5">
                    <img
                        src={authUser?.image || "/user-male.svg"}
                        alt="Profile"
                        className="w-7 h-7 rounded-full border border-gray-300"
                    />
                    <span>{authUser?.name}</span>
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <div className="py-2 px-4 flex gap-3">
                <img
                        src={authUser?.image || "/user-male.svg"}
                        alt="Profile"
                        className="rounded-full"
                    />
                   <div className="">
                   <h1 className="text-base font-semibold text-gray-900">{authUser?.name}</h1>
                   <p className="text-sm text-blue-600 truncate w-[160px]">{authUser?.email}</p>
                   </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href={`/settings/${authUser?.name}`}className="flex items-center gap-3">
                            <User className="w-5 h-5" /> Profile
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/cart" className="flex items-center gap-3">
                            <ShoppingCart className="w-5 h-5" /> My Cart
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/chat" className="flex items-center gap-3">
                            <MessageSquare className="w-5 h-5" /> Messages
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <div className="flex items-center gap-3 cursor-pointer">
                        <LogOutButton />
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
