import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

/**
 * Protected dashboard page
 * 
 * Server-side authentication check using getSession()
 * Middleware provides optimistic redirect, but this is the real security check
 * 
 * @see https://nextjs.org/docs/app/building-your-application/authentication
 */
export default async function Dashboard() {
  const session = await getSession()

  // Redirect to signin if not authenticated
  if (!session) {
    redirect('/signin?redirect=/dashboard')
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="space-y-2">
        <p>Welcome, {session.user.first_name} {session.user.last_name}!</p>
        <p className="text-sm text-gray-600">Email: {session.user.email}</p>
        <p className="text-sm text-gray-600">
          Email Verified: {session.user.email_verified ? 'Yes' : 'No'}
        </p>
      </div>
    </div>
  )
}