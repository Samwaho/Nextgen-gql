import { z } from "zod";
import {
  customerSchema,
  packageSchema,
  staffSchema,
  inventorySchema,
  ticketSchema,
} from "./schemas";

export interface Props {
  loggedInUser?: {
    id?: string;
    name?: string;
    email?: string;
  };
}

export type UserProps = z.infer<typeof customerSchema> & {
  id: string;
  status: "active" | "inactive" | "expired";
  createdAt: string;
  updatedAt: string | null;
};

export type StaffProps = z.infer<typeof staffSchema> & {
  id: string;
  createdAt: string;
  updatedAt: string | null;
};

export type InventoryProps = z.infer<typeof inventorySchema> & {
  id: string;
  agency: string;
  createdAt: string;
  updatedAt: string | null;
};

export type TicketProps = z.infer<typeof ticketSchema> & {
  id: string;
  createdAt: string;
  updatedAt: string | null;
  agency?: string;
  customer: {
    id: string;
    name: string;
    email: string;
    username: string;
  };
  assignedEmployee: {
    id: string;
    name: string;
    email: string;
    username: string;
  } | null;
};

export interface RouterProps {
  id: string;
  name: string;
  username: string;
  password: string;
  type: string;
  status: string;
  agency: string;
  ip: string | null;
  vpnUsername: string | null;
  vpnPassword: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export type PackageProps = z.infer<typeof packageSchema> & {
  id: string;
  agency: string;
  createdAt: string;
  updatedAt: string | null;
};
