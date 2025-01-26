import { z } from "zod";
import { phoneRegex } from "./utils";

export const signInFormSchema = z.object({
  username: z.string().email("Invalid email address"),
  password: z.string().min(5, "Password must contain at least 5 characters"),
});

export const signUpFormSchema = z.object({
  name: z.string().min(3, "Name must contain at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
  address: z.string().min(1, "Address is required"),
  phone: z
    .string()
    .regex(phoneRegex, "Please enter a valid Kenyan phone number"),
});

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address: z.string().min(1, "Address is required"),
  package: z.string().nullable(),
  station: z.string().nullable(),
  expiry: z.string(),
  radiusUsername: z.string().optional(),
});

export const mikrotikSchema = z.object({
  name: z.string().min(3, "Name must contain at least 3 characters"),
  ipAddress: z.string().ip("Invalid IP address"),
  password: z.string().min(3, "Password must contain at least 3 characters"),
  username: z.string().min(3, "Username must contain at least 3 characters"),
});

export const packageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().min(0, "Price must be greater than or equal to 0"),
  // Network settings
  downloadSpeed: z.coerce.number().min(0, "Download speed must be greater than or equal to 0"),
  uploadSpeed: z.coerce.number().min(0, "Upload speed must be greater than or equal to 0"),
  // Burst configuration
  burstDownload: z.coerce.number().nullable(),
  burstUpload: z.coerce.number().nullable(),
  thresholdDownload: z.coerce.number().nullable(),
  thresholdUpload: z.coerce.number().nullable(),
  burstTime: z.coerce.number().nullable(),
  // MikroTik service configuration
  serviceType: z.enum(["pppoe", "hotspot", "dhcp", "static"]).nullable(),
  addressPool: z.string().nullable(),
  // Session management
  sessionTimeout: z.coerce.number().nullable(),
  idleTimeout: z.coerce.number().nullable(),
  // QoS and VLAN
  priority: z.coerce.number().min(1).max(8).nullable(),
  vlanId: z.coerce.number().nullable(),
});

export const staffSchema = z.object({
  name: z.string().min(3, "Name must contain at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(4, "Password must contain at least 4 characters"),
  username: z.string().min(3, "Username must contain at least 3 characters"),
  phone: z
    .string()
    .regex(phoneRegex, "Please enter a valid Kenyan phone number"),
  role: z.enum(["admin", "employee"]),
});

export const inventorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().nonnegative("Price must be a non-negative number"),
  stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
  category: z.string().min(1, "Category is required"),
});

export const ticketSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["open", "in-progress", "closed"]),
  customer: z.string().min(1, "Customer is required"),
  assignedEmployee: z.string().nullable(),
});

export const routerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  type: z.string().min(1, "Type is required"),
});

export const agencySchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address"),
  website: z.string().optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  description: z.string().optional(),
  mpesaConsumerKey: z.string().optional(),
  mpesaConsumerSecret: z.string().optional(),
  mpesaShortcode: z.string().min(1, "M-Pesa Shortcode is required"),
  mpesaPasskey: z.string().optional(),
  mpesaEnv: z.string().min(1, "M-Pesa Environment is required"),
  mpesaB2cShortcode: z.string().optional(),
  mpesaB2bShortcode: z.string().optional(),
  mpesaInitiatorName: z.string().min(1, "M-Pesa Initiator Name is required"),
  mpesaInitiatorPassword: z.string().optional(),
});

export const stationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  address: z.string().min(1, "Address is required"),
  coordinates: z.string().optional(),
  buildingType: z.string().min(1, "Building type is required"),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

// Extended schemas with additional properties
export const extendedCustomerSchema = customerSchema.extend({
  id: z.string(),
  status: z.enum(["active", "inactive", "expired"]),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  station: z.object({
    id: z.string(),
    name: z.string(),
    location: z.string(),
    address: z.string(),
  }).nullable(),
});

export const extendedStaffSchema = staffSchema.extend({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});

export const extendedInventorySchema = inventorySchema.extend({
  id: z.string(),
  agency: z.string(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});

export const extendedTicketSchema = ticketSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  customer: z.union([
    z.string(),
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      username: z.string(),
    }),
  ]),
  assignedEmployee: z
    .union([
      z.string(),
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        username: z.string(),
      }),
    ])
    .nullable(),
});

export const extendedRouterSchema = routerSchema.extend({
  id: z.string(),
  agency: z.string(),
  ip: z.string().nullable(),
  vpnUsername: z.string().nullable(),
  vpnPassword: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});

export const extendedPackageSchema = packageSchema.extend({
  id: z.string(),
  agency: z.string(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});

export const extendedAgencySchema = agencySchema.extend({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});

export const extendedStationSchema = stationSchema.extend({
  id: z.string(),
  agency: z.string(),
  totalCustomers: z.number(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});

// Props type definitions
export type Props = {
  loggedInUser: {
    name: string;
    email: string;
    role: string;
  };
};

export type CustomerProps = z.infer<typeof extendedCustomerSchema>;
export type StaffProps = z.infer<typeof extendedStaffSchema>;
export type InventoryProps = z.infer<typeof extendedInventorySchema>;
export type TicketProps = z.infer<typeof extendedTicketSchema>;
export type RouterProps = z.infer<typeof extendedRouterSchema>;
export type PackageProps = z.infer<typeof extendedPackageSchema>;
export type AgencyProps = z.infer<typeof extendedAgencySchema>;
export type StationProps = z.infer<typeof extendedStationSchema>;
