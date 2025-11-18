'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { XCircle, Loader2 } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import Image from 'next/image'
import Link from 'next/link'
import type { VerifyEmailActionResult } from '@/core/api/auth/verify-email/actions'
import { verifyEmailAction } from '@/core/api/auth/verify-email/actions'

const OTPFormSchema = z.object({
  code: z
    .string()
    .min(6, {
      message: 'Your one-time password must be 6 characters.',
    })
    .max(6, {
      message: 'Your one-time password must be 6 characters.',
    }),
})

function ConfirmEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token') ?? ''
  const emailFromUrl = searchParams?.get('email') ?? ''

  // Use useActionState for server action
  const [state, formAction, isPending] = useActionState<VerifyEmailActionResult | null, FormData>(
    verifyEmailAction,
    null
  )

  // Redirect to signin if token is missing
  useEffect(() => {
    if (!token) {
      router.push('/signin')
    }
  }, [token, router])

  // Get email from sessionStorage (stored during signup) or URL params as fallback
  const [userEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = sessionStorage.getItem('pending_verification_email')
      return storedEmail || emailFromUrl || ''
    }
    return emailFromUrl || ''
  })

  const form = useForm<z.infer<typeof OTPFormSchema>>({
    resolver: zodResolver(OTPFormSchema),
    defaultValues: {
      code: '',
    },
  })

  // Handle server action result
  useEffect(() => {
    if (!state) return

    if (state.success) {
      // Clean up sessionStorage after successful verification
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('pending_verification_email')
      }
      toast.success('Email verified successfully!')
      // Note: The success UI will be shown below based on state
    } else {
      toast.error(state.error)
    }
  }, [state])

  // Show success state
  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <Image
          src="/images/otpbg.png"
          alt="Onboarding Background"
          width={500}
          height={500}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <div className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8 text-center relative z-10">
          <div className="flex justify-center items-center mb-6">
            <Image
              src="/icons/success.png"
              alt="Success"
              width={265}
              height={140}
            />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Email verified successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Email verified successfully! Please sign in to continue.
          </p>

          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="animate-bounce rounded-full h-8 w-8 border-b-2 border-custom-base-green"></div>
            <p className="text-sm text-gray-500">
              Your account is now active!
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={() => router.push('/signin')} className="w-full">
              Sign In Now
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (state && !state.success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <Image
          src="/images/otpbg.png"
          alt="Onboarding Background"
          width={1000}
          height={1000}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <div className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8 text-center relative z-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verification Failed
          </h2>
          <p className="text-gray-600 mb-6">{state.error}</p>
          <div className="space-y-3">
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
            <Button onClick={() => router.push('/signin')} variant="outline" className="w-full">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <Image
        src="/images/otpbg.png"
        alt="Onboarding Background"
        width={1000}
        height={1000}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <div className="w-full max-w-lg mx-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-none p-8 relative z-10">
        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-6">
          <Image
            src="/logo/humanlineblack.png"
            alt="Success"
            width={130}
            height={130}
          />

          <h2 className="text-[28px] font-bold text-gray-900 mt-4">
            Email Verification
          </h2>
          <p className="text-gray-600 text-lg leading-8">
            We have sent a verification code to email address {' '}
            <b>{userEmail || 'your email address'}</b>.{' '}
            <Link href="/signup" className="text-custom-base-green ml-2">
              Wrong Email?
            </Link>
          </p>
        </div>

        <Form {...form}>
          <form action={formAction} className="space-y-6 ">
            {/* Hidden input for token */}
            <input type="hidden" name="token" value={token} />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      {...field}
                    >
                      <InputOTPGroup className="flex gap-2 justify-center items-center mt-4 ml-6">
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 mx-8">
              <Button
                type="submit"
                className="w-full cursor-pointer h-13 mt-3 text-md"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <span>Submit</span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

function ConfirmEmailFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-custom-base-green" />
        <p className="text-gray-600">Loading verification form…</p>
      </div>
    </div>
  )
}

export default function ConfirmEmail() {
  return (
    <Suspense fallback={<ConfirmEmailFallback />}>
      <ConfirmEmailContent />
    </Suspense>
  )
}
