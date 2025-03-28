import { z } from 'zod';

// Form schemas
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

export const pinSchema = z.object({
  pin: z.string().length(6, 'PIN must be exactly 6 digits').regex(/^\d+$/, 'PIN must contain only numbers'),
  confirmPin: z.string().length(6, 'PIN must be exactly 6 digits'),
}).refine(data => data.pin === data.confirmPin, {
  message: "PINs don't match",
  path: ['confirmPin'],
});

export const tanKeySchema = z.object({
  confirmStorage: z.boolean().refine(val => val === true, {
    message: 'You must confirm you have safely stored your TanKey',
  }),
});

export const recoveryPhraseSchema = z.object({
  verificationWords: z.record(z.string()).refine((data) => {
    return Object.values(data).every(word => word.trim() !== '');
  }, {
    message: 'All verification words must be filled',
  }),
});

export const userBackgroundSchema = z.object({
  isMarried: z.enum(['yes', 'no', 'skip']),
  hasChildren: z.enum(['yes', 'no', 'skip']),
  ownsBusiness: z.enum(['yes', 'no', 'skip']),
  specificAssets: z.string().optional(),
});

export const authenticatorSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

export const locationSchema = z.object({
  country: z.string().min(2, 'Please select a country'),
  city: z.string().min(2, 'Please enter a city'),
});

export const templateSchema = z.object({
  templateChoice: z.string().min(1, 'Please select a template'),
});

export const kycSchema = z.object({
  idType: z.enum(['nationalId', 'passport', 'driversLicense']),
  idDocument: z.string().min(1, 'Please upload an ID document'),
  selfie: z.string().min(1, 'Please take a selfie'),
});

export const subscriptionSchema = z.object({
  plan: z.enum(['gold', 'platinum', 'lifetime']),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

export type UserDetailsInputs = z.infer<typeof userDetailsSchema>;
export type PinInputs = z.infer<typeof pinSchema>;
export type TanKeyInputs = z.infer<typeof tanKeySchema>;
export type RecoveryPhraseInputs = z.infer<typeof recoveryPhraseSchema>;
export type UserBackgroundInputs = z.infer<typeof userBackgroundSchema>;
export type AuthenticatorInputs = z.infer<typeof authenticatorSchema>;
export type LocationInputs = z.infer<typeof locationSchema>;
export type TemplateInputs = z.infer<typeof templateSchema>;
export type KycInputs = z.infer<typeof kycSchema>;
export type SubscriptionInputs = z.infer<typeof subscriptionSchema>;

export type SignUpStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
