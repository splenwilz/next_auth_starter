import { vi } from 'vitest'

// Mock Next.js cookies
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}))

// Mock window.location for client-side tests
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
})

