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
import { Input } from "../ui/input";
import { Settings } from "lucide-react";
import Notifications from "../notifications/page";

const Header: React.FC<Props> = ({ loggedInUser }) => {
  return (
    <div className="flex items-center justify-between w-full border-b border-border pb-1">
      <div className="block lg:hidden">
        <MobileSidebar loggedInUser={loggedInUser} />
      </div>
      <Input
        className="rounded-lg w-[200px] md:w-[250px] h-8"
        placeholder="Search..."
      />
      <div className="flex gap-2 items-center">
        <Notifications />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ModeToggle />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Switch mode</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Settings className="cursor-pointer w-[22px] h-[22px]" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Header;
