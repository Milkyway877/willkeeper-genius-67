
import { z } from 'zod';

// Password strength requirements
const MIN_PASSWORD_LENGTH = 8;

export const signUpSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" })
    .max(50, { message: "First name must be less than 50 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "First name can only contain letters, spaces, apostrophes, and hyphens" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" })
    .max(50, { message: "Last name must be less than 50 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "Last name can only contain letters, spaces, apostrophes, and hyphens" }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .min(5, { message: "Email must be at least 5 characters" })
    .max(100, { message: "Email must be less than 100 characters" }),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` })
    .max(100, { message: "Password must be less than 100 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
  passwordConfirm: z.string(),
  honeypot: z.string().optional(),
}).refine(data => data.password === data.passwordConfirm, {
  message: "Passwords do not match",
  path: ["passwordConfirm"],
});

// Type for signup form values
export type SignUpFormValues = z.infer<typeof signUpSchema>;

// Add missing schemas needed by the step components

// Location step schema
export const locationSchema = z.object({
  country: z.string().min(2, { message: "Country is required" }),
  city: z.string().min(2, { message: "City is required" })
});

export type LocationInputs = z.infer<typeof locationSchema>;

// User background step schema
export const userBackgroundSchema = z.object({
  isMarried: z.enum(['yes', 'no', 'skip']),
  hasChildren: z.enum(['yes', 'no', 'skip']),
  ownsBusiness: z.enum(['yes', 'no', 'skip']),
  specificAssets: z.string().optional()
});

export type UserBackgroundInputs = z.infer<typeof userBackgroundSchema>;

// Authenticator step schema
export const authenticatorSchema = z.object({
  otp: z.string().min(6, { message: "Please enter a valid 6-digit code" })
});

export type AuthenticatorInputs = z.infer<typeof authenticatorSchema>;

// KYC step schema
export const kycSchema = z.object({
  idType: z.enum(['passport', 'nationalId', 'driversLicense']),
  idDocument: z.string().min(1, { message: "Please upload an ID document" }),
  selfie: z.string().min(1, { message: "Please take a selfie" })
});

export type KycInputs = z.infer<typeof kycSchema>;

// Template step schema
export const templateSchema = z.object({
  templateChoice: z.string().min(1, { message: "Please select a template" })
});

export type TemplateInputs = z.infer<typeof templateSchema>;

// Subscription step schema
export const subscriptionSchema = z.object({
  plan: z.string().min(1, { message: "Please select a plan" }),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  }),
  billingPeriod: z.enum(['monthly', 'yearly', 'lifetime']).optional()
});

export type SubscriptionInputs = z.infer<typeof subscriptionSchema>;
