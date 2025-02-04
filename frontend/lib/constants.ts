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
    path: "/isp-manager",
    icon: LayoutDashboard,
  },
  {
    title: "Customers",
    path: "/isp-manager/customers",
    icon: Users,
  },
  {
    title: "Packages",
    path: "/isp-manager/packages",
    icon: Box,
  },
  {
    title: "Stations",
    path: "/isp-manager/stations",
    icon: Building,
  },
  {
    title: "Inventory",
    path: "/isp-manager/inventory",
    icon: Package,
  },
  {
    title: "Staff",
    path: "/isp-manager/staff",
    icon: UserCog,
  },
  {
    title: "Support Tickets",
    path: "/isp-manager/tickets",
    icon: Ticket,
  },
  {
    title: "Transactions",
    path: "/isp-manager/transactions",
    icon: DollarSign,
  },
  {
    title: "Agency",
    path: "/isp-manager/agency",
    icon: Warehouse,
  },
];
