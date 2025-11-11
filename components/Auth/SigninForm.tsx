'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useActionState, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react'
import type { EmailVerificationResponse } from '@/core/api/auth/signin/types'
import { toast } from 'sonner'
import OauthButtons from './OauthButtons'
import { signinAction } from '@/core/api/auth/signin/actions'
import type { SigninActionResult } from '@/core/api/auth/signin/actions'

const formSchema = z.object({
  email: z.email({
    error: 'Invalid email address.',
  }),
  password: z.string().min(8, {
    error: 'Password must be at least 8 characters.',
  }),
})

export default function SigninForm() {
  const searchParams = useSearchParams()
  const email = searchParams?.get('email') ?? ''
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  // Use useActionState for server action (React 19)
  // @see https://react.dev/reference/react/useActionState
  const [state, formAction, isPending] = useActionState<SigninActionResult | null, FormData>(
    signinAction,
    null
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email,
      password: '',
    },
  })

  // Handle server action result
  useEffect(() => {
    if (!state) return

    if (state.success) {
      const signinResponse = state.data

      // Check if response is EmailVerificationResponse
      // EmailVerificationResponse has pending_authentication_token and requires_verification
      if (
        signinResponse &&
        typeof signinResponse === 'object' &&
        'pending_authentication_token' in signinResponse &&
        'requires_verification' in signinResponse &&
        (signinResponse as EmailVerificationResponse).requires_verification
      ) {
        // Extract pending_authentication_token and add it to redirect URL
        const emailVerificationResponse = signinResponse as EmailVerificationResponse
        const token = emailVerificationResponse.pending_authentication_token
        router.push(`/confirm-email?token=${encodeURIComponent(token)}`)
      } else {
        // If no email verification required, redirect to dashboard
        toast.success('Login successful')
        router.push('/dashboard')
      }
    } else {
      // Show error toast
      toast.error(state.error)
    }
  }, [state, router])

  return (
    <Form {...form}>
      <form
        action={formAction}
        className="space-y-8 w-full p-14 lg:p-20 max-w-[600px] mx-auto"
      >
        {/* Login to you account header */}
        <div className="flex flex-col mt-2">
          <Image
            src="/images/ornament.png"
            className="mb-4"
            alt="ornament"
            width={100}
            height={100}
          />
          <h1 className="text-2xl text-center font-medium">
            Login first to your account
          </h1>
        </div>

        {/* Error message */}
        {state && !state.success && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {state.error}
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email Address <span className="text-red-500">*</span>
              </FormLabel>

              <FormControl>
                <Input
                  className="h-12 rounded-[10px] focus-visible:ring-0 focus-visible:border-custom-base-green"
                  placeholder="Input your registered email address"
                  {...field}
                  // Add name attribute for form data
                  name="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Password <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    className="h-12 rounded-[10px] focus-visible:ring-0 focus-visible:border-custom-base-green pr-12"
                    placeholder="Password"
                    {...field}
                    type={showPassword ? 'text' : 'password'}
                    // Add name attribute for form data
                    name="password"
                  />
                  {showPassword ? (
                    <EyeIcon
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-custom-grey-600 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  ) : (
                    <EyeOffIcon
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-custom-grey-600 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Remember me and Forgot password */}
        <div className="flex justify-between">
          <div className="flex items-center">
            <Checkbox />
            <Label
              className="text-sm ml-2 text-custom-grey-600 "
            >
              Remember me
            </Label>
          </div>
          <Link href="/forgot-password" className="text-sm text-custom-grey-600 ">
            Forgot password?
          </Link>
        </div>
        <Button
          className="w-full h-14 cursor-pointer rounded-[10px] bg-[#F1F2F4] hover:bg-custom-grey-900 text-[#A0AEC0] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Logging in...</span>
            </>
          ) : (
            <span>Login</span>
          )}
        </Button>

        {/* Or login with */}
        <div className="flex justify-center mt-4">
          <div className="w-full h-1 border-t border-[#E2E8F0]"></div>
          <span className="text-sm text-custom-grey-600 w-full text-center -mt-2">
            Or login with
          </span>
          <div className="w-full h-1 border-t border-[#E2E8F0]"></div>
        </div>
        {/* Google login and Apple login */}
        <OauthButtons />

        {/* Don't have an account? */}
        <div className="flex justify-center">
          <p className="text-sm text-custom-grey-600">
            You&apos;re new in here?{' '}
            <Link href="/signup" className="text-custom-base-green font-medium">
              Create Account
            </Link>
          </p>
        </div>
      </form>
    </Form>
  )
}