'use server'

import { oauthCallback } from "./services"
import type { OAuthCallbackRequest } from "./types"
import type { AuthResponse } from "../types"
import { setAuthCookies } from "@/lib/auth"

export type OAuthCallbackActionResult =
    | { success: true; data: AuthResponse }
    | { success: false; error: string }

/**
 * Server action for OAuth callback
 * Handles OAuth callback from provider and sets authentication cookies
 * 
 * @param data - OAuth callback data with code and optional state
 * @returns Promise resolving to OAuth callback result
 */
export async function oauthCallbackAction(
    data: OAuthCallbackRequest
): Promise<OAuthCallbackActionResult> {
    try {
        if (!data.code) {
            return {
                success: false,
                error: 'Authorization code is required',
            }
        }

        // Call OAuth callback service
        const authResponse = await oauthCallback(data)

        // Set authentication cookies
        await setAuthCookies(authResponse)

        return {
            success: true,
            data: authResponse,
        }
    } catch (error) {
        console.error('[AUTH] OAuth callback failed:', error)

        // Extract error message with better error handling
        let errorMessage = 'Failed to complete OAuth authentication. Please try again.'

        if (error instanceof Error) {
            errorMessage = error.message

            // Check if it's an ApiError with status code
            if ('status' in error && typeof error.status === 'number') {
                const apiError = error as { status: number; message: string }
                console.error('[AUTH] API Error details:', {
                    status: apiError.status,
                    message: apiError.message,
                    code: data.code,
                })

                // Provide more specific error messages based on status
                if (apiError.status === 400) {
                    errorMessage = 'Invalid authorization code. Please try signing in again.'
                } else if (apiError.status === 401) {
                    errorMessage = 'Authentication failed. Please try signing in again.'
                } else if (apiError.status >= 500) {
                    errorMessage = 'Server error occurred. Please try again later.'
                } else {
                    errorMessage = apiError.message || errorMessage
                }
            }
        }

        return {
            success: false,
            error: errorMessage,
        }
    }
}

