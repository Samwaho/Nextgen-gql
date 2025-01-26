import {
  Users,
  Box,
  Package,
  UserCog,
  Ticket,
  DollarSign,
  Warehouse,
  Building,
  LayoutDashboard,
} from "lucide-react";

interface SidebarItem {
  title: string;
  path: string;
  icon:
    | typeof LayoutDashboard
    | typeof Users 
    | typeof Box
    | typeof Building
    | typeof Package
    | typeof UserCog
    | typeof Ticket
    | typeof DollarSign
    | typeof Warehouse;
}

export const sidebarData: SidebarItem[] = [
  {
    title: "Dashboard",
    path: "/main/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Customers",
    path: "/main/customers",
    icon: Users,
  },
  {
    title: "Packages",
    path: "/main/packages",
    icon: Box,
  },
  {
    title: "Stations",
    path: "/main/stations",
    icon: Building,
  },
  {
    title: "Inventory",
    path: "/main/inventory",
    icon: Package,
  },
  {
    title: "Staff",
    path: "/main/staff",
    icon: UserCog,
  },
  {
    title: "Support Tickets",
    path: "/main/tickets",
    icon: Ticket,
  },
  {
    title: "Transactions",
    path: "/main/transactions",
    icon: DollarSign,
  },
  {
    title: "Agency",
    path: "/main/agency",
    icon: Warehouse,
  },
];
