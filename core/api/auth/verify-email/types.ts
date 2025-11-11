import { z } from "zod";

/**
 * Schema for user verify email request
 */

export const VerifyEmailRequestSchema = z.object({
  pending_authentication_token: z.string(),
  code: z.string().length(6, { error: () => "Verification code must be 6 digits" }),
})

export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequestSchema>;