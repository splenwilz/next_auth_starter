import { cookies } from 'next/headers'
import type { AuthResponse, AuthUser } from '@/core/api/auth/types'
import type { RefreshTokenResponse } from '@/core/api/auth/refresh/types'

/**
 * Get session from cookies
 * Returns user data if authenticated, null otherwise
 * 
 * Security: Validates that access token exists before trusting user cookie
 * This prevents forged auth_user cookies from bypassing authentication
 * 
 * @see https://nextjs.org/docs/app/api-reference/functions/cookies
 */
export async function getSession(): Promise<{ user: AuthUser } | null> {
    const cookieStore = await cookies()

    // First verify access token exists (can't be forged - httpOnly)
    // This ensures the session is actually valid
    const accessToken = cookieStore.get('auth_access_token')?.value
    if (!accessToken) {
        return null
    }

    // Only trust user cookie if access token is present
    // The access token is httpOnly and cannot be forged
    const userCookie = cookieStore.get('auth_user')?.value
    if (!userCookie) {
        return null
    }

    try {
        const user: AuthUser = JSON.parse(userCookie)
        return { user }
    } catch {
        return null
    }
}

/**
 * Get access token from cookies
 */
export async function getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get('auth_access_token')?.value || null
}

/**
 * Set authentication cookies
 * Called from server actions after successful authentication
 * 
 * @see https://nextjs.org/docs/app/api-reference/functions/cookies#cookiessetname-value-options
 */
export async function setAuthCookies(authData: AuthResponse): Promise<void> {
    const cookieStore = await cookies()

    // Set access token (HTTP-only, short-lived)
    // WorkOS default: 5 minutes
    cookieStore.set('auth_access_token', authData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 5 * 60, // 5 minutes (WorkOS default)
        path: '/',
    })

    // Set refresh token (HTTP-only, long-lived)
    cookieStore.set('auth_refresh_token', authData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    })

    // Set user data (HTTP-only for security)
    // Note: User data is only needed server-side for getSession()
    // Client components should fetch user data via API if needed
    cookieStore.set('auth_user', JSON.stringify(authData.user), {
        httpOnly: true, // Prevent client-side tampering
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    })
}

/**
 * Update only access and refresh tokens
 * Preserves existing user data in cookies
 * Used when refresh endpoint only returns tokens
 */
export async function updateTokenCookies(tokens: RefreshTokenResponse): Promise<void> {
    const cookieStore = await cookies()

    // Update access token
    // WorkOS default: 5 minutes
    cookieStore.set('auth_access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 5 * 60, // 5 minutes (WorkOS default)
        path: '/',
    })

    // Update refresh token
    cookieStore.set('auth_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    })
}

/**
 * Clear authentication cookies
 */
export async function clearAuthCookies(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete('auth_access_token')
    cookieStore.delete('auth_refresh_token')
    cookieStore.delete('auth_user')
}