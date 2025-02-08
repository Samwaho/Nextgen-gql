"use client";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { sidebarData } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Menu, X, UserCircle, LogOut } from "lucide-react";
import { useMutation } from "@apollo/client";
import { LOGOUT_MUTATION, removeAuthToken } from "@/graphql/auth";

import { Props } from "@/lib/props";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const MobileSidebar: React.FC<Props> = ({ loggedInUser }) => {
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
    <Drawer direction="left">
      <DrawerTrigger>
        <Menu className="cursor-pointer size-8 text-muted-foreground hover:text-fuchsia-500 transition-colors" />
      </DrawerTrigger>
      <DrawerContent className="h-full w-[80vw] p-0 rounded-r-3xl">
        <div className="flex flex-col justify-between h-full bg-card_light dark:bg-card_dark dark:glass-card rounded-r-3xl">
          <div>
            <DrawerHeader className="flex justify-between items-center px-6 pt-6">
              <DrawerTitle>
                <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                  NetGN
                </span>
              </DrawerTitle>
              <DrawerClose>
                <X className="cursor-pointer size-6 text-muted-foreground hover:text-fuchsia-500 transition-colors" />
              </DrawerClose>
            </DrawerHeader>
            <div className="px-4 py-2">
              <Command className="bg-transparent">
                <CommandInput
                  placeholder="Search menu item..."
                  className="border-none focus:ring-2 focus:ring-fuchsia-500"
                />

                <CommandList className="mt-4">
                  <CommandEmpty>No results found.</CommandEmpty>
                  {sidebarData.map((item) => (
                    <CommandItem
                      key={item.title}
                      className="py-2 px-1 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/20 rounded-md transition-colors"
                    >
                      <Link
                        className="flex items-center gap-4 w-full"
                        href={item.path}
                      >
                        <i
                          className={`p-1 rounded-md shadow-md text-white transition-all duration-300 ${
                            (item.path === "/main" && pathname === "/main") || 
                            (item.path !== "/main" && pathname.startsWith(item.path))
                              ? "bg-gradient-custom scale-110"
                              : "bg-gradient-custom2 hover:scale-105"
                          }`}
                        >
                          <item.icon className="size-4" />
                        </i>
                        <p
                          className={`text-md font-medium ${
                            (item.path === "/main" && pathname === "/main") || 
                            (item.path !== "/main" && pathname.startsWith(item.path))
                              ? "text-fuchsia-600 dark:text-fuchsia-400"
                              : "text-muted-foreground"
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
            <DrawerFooter className="border-t border-border/50 px-6 py-4">
              <Popover>
                <PopoverTrigger className="w-full">
                  <div className="flex items-center justify-between hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/20 p-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 group">
                      <div className="flex size-8 items-center justify-center rounded-full bg-gradient-custom shadow-md group-hover:scale-105 transition-transform">
                        <p className="text-white uppercase font-medium">
                          {loggedInUser?.name?.[0] || "U"}
                        </p>
                      </div>
                      <p className="text-md capitalize font-medium text-muted-foreground group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                        {loggedInUser?.name || "User"}
                      </p>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2 glass-card rounded-xl">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 p-2.5 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/20 rounded-lg transition-colors"
                  >
                    <div className="p-1 bg-fuchsia-100 dark:bg-fuchsia-900/20 rounded-full">
                      <UserCircle className="size-4 text-fuchsia-500 dark:text-fuchsia-400" />
                    </div>
                    <span className="font-medium text-foreground">View Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 p-2.5 w-full hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-lg text-rose-500 transition-colors mt-1"
                  >
                    <div className="p-1 bg-rose-100 dark:bg-rose-900/20 rounded-full">
                      <LogOut className="size-4" />
                    </div>
                    <span className="font-medium">Logout</span>
                  </button>
                </PopoverContent>
              </Popover>
            </DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileSidebar;
