
import { z } from "zod";

// Simple schemas for compatibility
export const locationSchema = z.object({
  country: z.string().optional(),
  city: z.string().optional()
});

export const userBackgroundSchema = z.object({
  isMarried: z.enum(["yes", "no", "skip"]),
  hasChildren: z.enum(["yes", "no", "skip"]),
  ownsBusiness: z.enum(["yes", "no", "skip"]),
  specificAssets: z.string().optional()
});

export const templateSchema = z.object({
  templateChoice: z.string().optional()
});

export const kycSchema = z.object({
  idType: z.string(),
  idDocument: z.string().optional(),
  selfie: z.string().optional()
});

export const authenticatorSchema = z.object({
  otp: z.string().min(6).max(6).optional()
});

export const subscriptionSchema = z.object({
  plan: z.string(),
  agreeToTerms: z.boolean(),
  billingPeriod: z.enum(["monthly", "yearly", "lifetime"]).optional()
});

// Types based on schemas
export type LocationInputs = z.infer<typeof locationSchema>;
export type UserBackgroundInputs = z.infer<typeof userBackgroundSchema>;
export type TemplateInputs = z.infer<typeof templateSchema>;
export type KycInputs = z.infer<typeof kycSchema>;
export type AuthenticatorInputs = z.infer<typeof authenticatorSchema>;
export type SubscriptionInputs = z.infer<typeof subscriptionSchema>;
