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
  name: z.string().min(3, "Name must contain at least 3 characters"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  phone: z
    .string()
    .regex(phoneRegex, "Please enter a valid Kenyan phone number"),
  username: z.string().min(3, "Username must contain at least 3 characters"),
  password: z.string().min(4, "Password must contain at least 4 characters"),
  expiry: z.string().datetime(),
  package: z.string().nullable(),
});

export const mikrotikSchema = z.object({
  name: z.string().min(3, "Name must contain at least 3 characters"),
  ipAddress: z.string().ip("Invalid IP address"),
  password: z.string().min(3, "Password must contain at least 3 characters"),
  username: z.string().min(3, "Username must contain at least 3 characters"),
});

export const packageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  bandwidth: z.string().min(1, "Bandwidth is required"),
  type: z.string().min(1, "Type is required"),
  downloadSpeed: z.coerce
    .number()
    .min(0, "Download speed must be a positive number"),
  uploadSpeed: z.coerce
    .number()
    .min(0, "Upload speed must be a positive number"),
  burstDownload: z.coerce
    .number()
    .min(0, "Burst download must be a positive number")
    .nullable(),
  burstUpload: z.coerce
    .number()
    .min(0, "Burst upload must be a positive number")
    .nullable(),
  thresholdDownload: z.coerce
    .number()
    .min(0, "Threshold download must be a positive number")
    .nullable(),
  thresholdUpload: z.coerce
    .number()
    .min(0, "Threshold upload must be a positive number")
    .nullable(),
  burstTime: z.coerce
    .number()
    .min(0, "Burst time must be a positive number")
    .nullable(),
  radiusProfile: z.string().nullable(),
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
  name: z.string().min(1, "Agency name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  website: z.string().min(1, "Website is required"),
  logo: z.string().min(1, "Logo URL is required"),
  banner: z.string().min(1, "Banner URL is required"),
  description: z.string().min(1, "Description is required"),
  mpesaConsumerKey: z.string().min(1, "M-Pesa Consumer Key is required"),
  mpesaConsumerSecret: z.string().min(1, "M-Pesa Consumer Secret is required"),
  mpesaShortcode: z.string().min(1, "M-Pesa Shortcode is required"),
  mpesaPasskey: z.string().min(1, "M-Pesa Passkey is required"),
  mpesaEnv: z.string().min(1, "M-Pesa Environment is required"),
});

// Extended schemas with additional properties
export const extendedCustomerSchema = customerSchema.extend({
  id: z.string(),
  status: z.enum(["active", "inactive", "expired"]),
  created_at: z.string(),
  updated_at: z.string().nullable(),
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
  created_at: z.string(),
  updated_at: z.string().nullable(),
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
