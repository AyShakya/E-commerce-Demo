import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address: z.object({
    fullName: z.string().trim().min(1, "Full name is required"),
    phone: z.string().trim().min(7, "Phone number is invalid"),
    line1: z.string().trim().min(1, "Address line 1 is required"),
    line2: z.string().trim().optional(),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    postalCode: z.string().trim().min(3, "Postal code is invalid"),
    country: z.string().trim().default("India"),
  }).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const addressSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim().min(7, "Phone number must be at least 7 characters"),
  line1: z.string().trim().min(1, "Address line 1 is required"),
  line2: z.string().trim().optional().default(""),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  postalCode: z.string().trim().min(3, "Postal code must be at least 3 characters"),
  country: z.string().trim().default("India"),
});
