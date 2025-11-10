'use server'

import type { AuthResponse } from '../types'
import { verifyEmail } from './services'
import type { VerifyEmailRequest } from './types'

/**
 * Server action result type for verify email
 */
export type VerifyEmailActionResult =
    | { success: true; data: AuthResponse }
    | { success: false; error: string }

/**
 * Server action for email verification
 * 
 * @param prevState - Previous action state (for useActionState)
 * @param formData - Form data containing verification token and code
 * @returns Promise resolving to verification result
 */
export async function verifyEmailAction(
    prevState: VerifyEmailActionResult | null,
    formData: FormData
): Promise<VerifyEmailActionResult> {
    try {
        const token = formData.get('token')?.toString()
        const code = formData.get('code')?.toString()

        if (!token || !code) {
            return {
                success: false,
                error: 'Token and code are required',
            }
        }

        const requestBody: VerifyEmailRequest = {
            pending_authentication_token: token,
            code,
        }

        const response = await verifyEmail(requestBody)

        return {
            success: true,
            data: response,
        }
    } catch (error) {
        const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to verify email. Please try again.'

        return {
            success: false,
            error: errorMessage,
        }
    }
}