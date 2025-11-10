import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AuthResponse, AuthUser } from '@/core/api/auth/types'
import type { RefreshTokenResponse } from '@/core/api/auth/refresh/types'

// Mock next/headers
const mockCookieStore = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
}

vi.mock('next/headers', () => ({
    cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}))

describe('Auth utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.stubEnv('NODE_ENV', 'test')
    })

    describe('getSession', () => {
        it('should return user data when auth_user cookie exists', async () => {
            const { getSession } = await import('../auth')

            const mockUser: AuthUser = {
                object: 'user',
                id: 'user_123',
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User',
                email_verified: true,
                profile_picture_url: '',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            }

            mockCookieStore.get.mockReturnValue({
                value: JSON.stringify(mockUser),
            })

            const result = await getSession()

            expect(result).toEqual({ user: mockUser })
            expect(mockCookieStore.get).toHaveBeenCalledWith('auth_user')
        })

        it('should return null when auth_user cookie does not exist', async () => {
            const { getSession } = await import('../auth')

            mockCookieStore.get.mockReturnValue(undefined)

            const result = await getSession()

            expect(result).toBeNull()
        })

        it('should return null when cookie value is invalid JSON', async () => {
            const { getSession } = await import('../auth')

            mockCookieStore.get.mockReturnValue({
                value: 'invalid-json',
            })

            const result = await getSession()

            expect(result).toBeNull()
        })
    })

    describe('getAccessToken', () => {
        it('should return access token from cookie', async () => {
            const { getAccessToken } = await import('../auth')

            mockCookieStore.get.mockReturnValue({
                value: 'test-access-token',
            })

            const result = await getAccessToken()

            expect(result).toBe('test-access-token')
            expect(mockCookieStore.get).toHaveBeenCalledWith('auth_access_token')
        })

        it('should return null when token does not exist', async () => {
            const { getAccessToken } = await import('../auth')

            mockCookieStore.get.mockReturnValue(undefined)

            const result = await getAccessToken()

            expect(result).toBeNull()
        })
    })

    describe('setAuthCookies', () => {
        it('should set all auth cookies with correct options', async () => {
            const { setAuthCookies } = await import('../auth')

            const mockAuthData: AuthResponse = {
                access_token: 'access-token-123',
                refresh_token: 'refresh-token-123',
                authentication_method: 'password',
                user: {
                    object: 'user',
                    id: 'user_123',
                    email: 'test@example.com',
                    first_name: 'Test',
                    last_name: 'User',
                    email_verified: true,
                    profile_picture_url: '',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                },
                sealed_session: 'sealed-session-123',
            }

            await setAuthCookies(mockAuthData)

            expect(mockCookieStore.set).toHaveBeenCalledTimes(3)

            // Access token cookie
            expect(mockCookieStore.set).toHaveBeenCalledWith(
                'auth_access_token',
                'access-token-123',
                {
                    httpOnly: true,
                    secure: false, // NODE_ENV is 'test'
                    sameSite: 'lax',
                    maxAge: 5 * 60, // 5 minutes (WorkOS default)
                    path: '/',
                }
            )

            // Refresh token cookie
            expect(mockCookieStore.set).toHaveBeenCalledWith(
                'auth_refresh_token',
                'refresh-token-123',
                {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7, // 7 days
                    path: '/',
                }
            )

            // User data cookie
            expect(mockCookieStore.set).toHaveBeenCalledWith(
                'auth_user',
                JSON.stringify(mockAuthData.user),
                {
                    httpOnly: false,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7, // 7 days
                    path: '/',
                }
            )
        })

        it('should set secure flag in production', async () => {
            const { setAuthCookies } = await import('../auth')
            vi.stubEnv('NODE_ENV', 'production')

            const mockAuthData: AuthResponse = {
                access_token: 'access-token-123',
                refresh_token: 'refresh-token-123',
                authentication_method: 'password',
                user: {
                    object: 'user',
                    id: 'user_123',
                    email: 'test@example.com',
                    first_name: 'Test',
                    last_name: 'User',
                    email_verified: true,
                    profile_picture_url: '',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                },
                sealed_session: 'sealed-session-123',
            }

            await setAuthCookies(mockAuthData)

            // Check that secure is true for HTTP-only cookies
            const accessTokenCall = mockCookieStore.set.mock.calls.find(
                (call) => call[0] === 'auth_access_token'
            )
            expect(accessTokenCall?.[2]?.secure).toBe(true)

            vi.stubEnv('NODE_ENV', 'test')
        })
    })

    describe('updateTokenCookies', () => {
        it('should update only access and refresh token cookies', async () => {
            const { updateTokenCookies } = await import('../auth')

            const mockTokens: RefreshTokenResponse = {
                access_token: 'new-access-token',
                refresh_token: 'new-refresh-token',
            }

            await updateTokenCookies(mockTokens)

            expect(mockCookieStore.set).toHaveBeenCalledTimes(2)

            // Should update access token
            expect(mockCookieStore.set).toHaveBeenCalledWith(
                'auth_access_token',
                'new-access-token',
                {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 5 * 60, // 5 minutes
                    path: '/',
                }
            )

            // Should update refresh token
            expect(mockCookieStore.set).toHaveBeenCalledWith(
                'auth_refresh_token',
                'new-refresh-token',
                {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7, // 7 days
                    path: '/',
                }
            )

            // Should NOT update user cookie
            const userCookieCall = mockCookieStore.set.mock.calls.find(
                (call) => call[0] === 'auth_user'
            )
            expect(userCookieCall).toBeUndefined()
        })
    })

    describe('clearAuthCookies', () => {
        it('should delete all auth cookies', async () => {
            const { clearAuthCookies } = await import('../auth')

            await clearAuthCookies()

            expect(mockCookieStore.delete).toHaveBeenCalledTimes(3)
            expect(mockCookieStore.delete).toHaveBeenCalledWith('auth_access_token')
            expect(mockCookieStore.delete).toHaveBeenCalledWith('auth_refresh_token')
            expect(mockCookieStore.delete).toHaveBeenCalledWith('auth_user')
        })
    })
})

