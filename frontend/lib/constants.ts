import {
  Home,
  Settings,
  Users,
  FileText,
  Mail,
  Box,
  Package,
  UserCog,
  Ticket,
  DollarSign,
  Building2,
} from "lucide-react";

interface SidebarItem {
  title: string;
  path: string;
  icon:
    | typeof Home
    | typeof Settings
    | typeof Users
    | typeof FileText
    | typeof Mail; // Using Lucide icons
}

export const sidebarData: SidebarItem[] = [
  {
    title: "Dashboard",
    path: "/main/dashboard",
    icon: Home,
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
    icon: Building2,
  },
];
