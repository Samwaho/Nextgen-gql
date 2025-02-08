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
} from "lucide-react";
import NotificationsDrawer from "./NotificationsDrawer";
import { Button } from "../ui/button";
import ProfileMenu from "../ProfileMenu";

const Header: React.FC<Props> = ({ loggedInUser }) => {
  const userProfile = loggedInUser ? { name: loggedInUser.name } : { name: undefined };
  
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

        <ProfileMenu user={userProfile} />
      </div>
    </div>
  );
};

export default Header; 