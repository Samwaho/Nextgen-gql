"use client";

import { UserCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import { LOGOUT_MUTATION, removeAuthToken } from "@/graphql/auth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ProfileMenuProps {
  user: {
    name?: string;
  };
}

const ProfileMenu = ({ user }: ProfileMenuProps) => {
  const [logout] = useMutation(LOGOUT_MUTATION);

  const handleLogout = async () => {
    try {
      await logout();
      removeAuthToken();
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger>
        <div className="flex items-center gap-2 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/20 p-2 rounded-lg transition-colors">
          <div className="flex w-8 h-8 items-center justify-center rounded-full bg-gradient-custom shadow-md hover:scale-105 transition-transform">
            <p className="text-white uppercase font-medium">
              {user?.name?.[0] || "U"}
            </p>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 bg-background border-border/50 shadow-lg rounded-xl">
        <Link
          href="/profile"
          className="flex items-center gap-2 p-2.5 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/20 rounded-lg transition-colors text-foreground"
        >
          <UserCircle className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">View Profile</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 p-2.5 w-full hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-lg text-rose-500 transition-colors mt-1"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Logout</span>
        </button>
      </PopoverContent>
    </Popover>
  );
};

export default ProfileMenu; 