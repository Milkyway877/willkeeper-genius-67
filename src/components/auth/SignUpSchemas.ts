import { z } from 'zod';
import { BillingPeriod } from '@/pages/tank/types';

// Basic user details schema for signup
export const userDetailsSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type UserDetailsInputs = z.infer<typeof userDetailsSchema>;

// We need to keep these schemas as they're imported by step components
// but they're not actually used in the new simplified sign-up process

// Authenticator schema
export const authenticatorSchema = z.object({
  authMethod: z.string().min(1, 'Please select an authentication method'),
  phoneNumber: z.string().optional(),
  verificationCode: z.string().optional(),
  otp: z.string().optional(),
});

export type AuthenticatorInputs = z.infer<typeof authenticatorSchema>;

// KYC schema
export const kycSchema = z.object({
  idType: z.string().min(1, 'Please select an ID type'),
  idNumber: z.string().min(1, 'ID number is required'),
  idExpiryDate: z.date().optional(),
  idFrontImage: z.string().optional(),
  idBackImage: z.string().optional(),
  selfieImage: z.string().optional(),
  idDocument: z.string().optional(),
  selfie: z.string().optional(),
});

export type KycInputs = z.infer<typeof kycSchema>;

// Location schema
export const locationSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
});

export type LocationInputs = z.infer<typeof locationSchema>;

// User background schema
export const userBackgroundSchema = z.object({
  occupation: z.string().min(1, 'Occupation is required'),
  familyStatus: z.string().min(1, 'Family status is required'),
  dependents: z.number().int().min(0, 'Number must be 0 or more'),
  assets: z.array(z.string()).optional(),
  isMarried: z.string().optional(),
  hasChildren: z.string().optional(),
  ownsBusiness: z.string().optional(),
  specificAssets: z.string().optional(),
});

export type UserBackgroundInputs = z.infer<typeof userBackgroundSchema>;

// Subscription schema
export const subscriptionSchema = z.object({
  plan: z.string().min(1, 'Please select a plan'),
  billingCycle: z.string().optional(),
  billingPeriod: z.string().optional(),
  paymentMethod: z.string().optional(),
  agreeToTerms: z.boolean().optional(),
});

export type SubscriptionInputs = z.infer<typeof subscriptionSchema>;

// Template schema
export const templateSchema = z.object({
  templateChoice: z.string().min(1, 'Please select a template'),
});

export type TemplateInputs = z.infer<typeof templateSchema>;
