import z from "zod";

export const ResetPasswordRequestSchema = z.object({
    token: z.string().min(1, { message: 'Token is required' }),
    new_password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    confirm_new_password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
})

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;