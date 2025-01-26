"use client";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { sidebarData } from "@/lib/constants";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, UserCircle, LogOut } from "lucide-react";
import { useMutation } from "@apollo/client";
import { LOGOUT_MUTATION, removeAuthToken } from "@/graphql/auth";

import { Props } from "@/lib/props";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const Sidebar: React.FC<Props> = ({ loggedInUser }) => {
  const pathname = usePathname();
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
    <div className="h-[95dvh] bg-card_light dark:bg-card_dark p-6 flex-1 shadow-lg rounded-3xl hidden md:flex flex-col justify-between transition-all duration-300 hover:shadow-xl">
      <div>
        <div className="flex justify-between items-center mb-6">
          <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            NextGen
          </span>
          <Menu className="cursor-pointer size-5 hover:text-purple-500 transition-colors" />
        </div>
        <div className="-ms-2">
          <Command className="bg-transparent">
            <CommandInput
              placeholder="Search menu item..."
              className="border-none focus:ring-2 focus:ring-purple-500"
            />

            <CommandList className="mt-4">
              <CommandEmpty>No results found.</CommandEmpty>
              {sidebarData.map((item) => (
                <CommandItem
                  key={item.title}
                  className="py-2 px-1 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors"
                >
                  <Link
                    className="flex items-center gap-4 w-full"
                    href={item.path}
                  >
                    <i
                      className={`p-1 rounded-md shadow-md text-white transition-all duration-300 ${
                        pathname.startsWith(item.path)
                          ? "bg-gradient-custom scale-110"
                          : "bg-gradient-custom2 hover:scale-105"
                      }`}
                    >
                      <item.icon className="size-4" />
                    </i>
                    <p
                      className={`text-md font-medium ${
                        pathname.startsWith(item.path)
                          ? "text-purple-600 dark:text-purple-400"
                          : ""
                      }`}
                    >
                      {item.title}
                    </p>
                  </Link>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </div>
      </div>

      {loggedInUser && (
        <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Popover>
            <PopoverTrigger className="w-full">
              <div className="flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-900/20 p-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3 group">
                  <div className="flex size-8 items-center justify-center rounded-full bg-gradient-custom shadow-md group-hover:scale-105 transition-transform">
                    <p className="text-white uppercase font-medium">
                      {loggedInUser?.name[0]}
                    </p>
                  </div>
                  <p className="text-md capitalize font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {loggedInUser?.name}
                  </p>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 border border-gray-100 dark:border-gray-800 shadow-lg rounded-xl bg-white dark:bg-gray-900">
              <Link
                href="/main/profile"
                className="flex items-center gap-2 p-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
              >
                <UserCircle className="size-4.5" />
                <span className="font-medium">View Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 p-2.5 w-full hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors mt-1"
              >
                <LogOut className="size-4.5" />
                <span className="font-medium">Logout</span>
              </button>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
