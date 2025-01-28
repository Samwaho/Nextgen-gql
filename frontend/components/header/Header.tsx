"use client";

import React from "react";
import { ModeToggle } from "../ModeToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import MobileSidebar from "../sidebar/MobileSidebar";
import { Props } from "@/lib/props";
import { 
  Search, 
  HelpCircle,
  UserCircle,
  LogOut
} from "lucide-react";
import NotificationsDrawer from "./NotificationsDrawer";
import { Button } from "../ui/button";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import { LOGOUT_MUTATION, removeAuthToken } from "@/graphql/auth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Header: React.FC<Props> = ({ loggedInUser }) => {
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
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <div className="block lg:hidden">
          <MobileSidebar loggedInUser={loggedInUser} />
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-background border border-border/50 rounded-lg min-w-[240px]">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Quick search..."
            className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground/70"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <NotificationsDrawer loggedInUser={loggedInUser} />
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={10} className="bg-background border-border/50">
              <p className="text-foreground">Notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <ModeToggle />

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/20">
                <HelpCircle className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={10} className="bg-background border-border/50">
              <p className="text-foreground">Help & Resources</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Popover>
          <PopoverTrigger>
            <div className="flex items-center gap-2 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/20 p-2 rounded-lg transition-colors">
              <div className="flex w-8 h-8 items-center justify-center rounded-full bg-gradient-custom shadow-md hover:scale-105 transition-transform">
                <p className="text-white uppercase font-medium">
                  {loggedInUser?.name?.[0] || "U"}
                </p>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2 bg-background border-border/50 shadow-lg rounded-xl">
            <Link
              href="/main/profile"
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
      </div>
    </div>
  );
};

export default Header; 