"use client"
import Image from "next/image";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useActionState, useEffect, Suspense } from "react";
import { redirect, useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, EyeIcon, EyeOffIcon, XCircleIcon } from "lucide-react";
import { resetPasswordAction, type ResetPasswordActionResult } from "@/core/api/auth/reset-password/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token') ?? ''

  const [state, formAction, isPending] = useActionState<ResetPasswordActionResult | null, FormData>(
    resetPasswordAction,
    null
  )
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showFallback, setShowFallback] = useState(false)

  // Password validation rules
  const validations = {
    minLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
  }

  // Handle server action result
  useEffect(() => {
    if (!state) return

    if (state.success) {
      toast.success('Password reset successfully!')
      router.push('/signin')
    } else {
      toast.error(state.error)
    }
  }, [state, router])

  useEffect(() => {
    if (!token) return

    if (typeof window === 'undefined') return

    const isMobile = /iphone|ipad|android/i.test(window.navigator.userAgent)

    if (!isMobile) {
      const immediate = window.setTimeout(() => setShowFallback(true), 0)
      return () => window.clearTimeout(immediate)
    }

    const appUrl = `tryrackapp://auth/reset-password?token=${encodeURIComponent(token)}`
    window.location.href = appUrl

    const timeout = window.setTimeout(() => {
      setShowFallback(true)
    }, 1500)

    return () => window.clearTimeout(timeout)
  }, [token])

  if (!token) {
    redirect('/signin')
    return null
  }

  if (!showFallback) {
    return <MobileRedirectLoading />
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
            Update your password
          </h2>
          <p className="text-gray-600 text-[16px] leading-8">
            Set your new password with minimum 8 characters with a combination of letters and numbers
          </p>
        </div>
        <form action={formAction} className="w-full">
          <input type="hidden" name="token" value={token} />
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="newpassword">New Password <span className="text-red-500">*</span></FieldLabel>
                <div className="relative">
                  <Input
                    autoComplete="off"
                    name="new_password"
                    placeholder="Enter your new password"
                    className="h-12 rounded-[10px] focus-visible:ring-0 focus-visible:border-custom-base-green"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {/* Real-time password validations */}
                <div className="grid grid-cols-2 items-center gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    {validations.minLength ? (
                      <CheckCircle className="h-4 w-4 text-custom-base-green" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-custom-grey-600 text-sm">8 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {validations.hasNumber ? (
                      <CheckCircle className="h-4 w-4 text-custom-base-green" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-custom-grey-600 text-sm">Number (0-9)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {validations.hasUppercase ? (
                      <CheckCircle className="h-4 w-4 text-custom-base-green" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-custom-grey-600 text-sm">Uppercase letter (A-Z)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {validations.hasLowercase ? (
                      <CheckCircle className="h-4 w-4 text-custom-base-green" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-custom-grey-600 text-sm">Lowercase letter (a-z)</span>
                  </div>
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmpassword">Confirm Password <span className="text-red-500">*</span></FieldLabel>
                <div className="relative">
                  <Input
                    autoComplete="off"
                    name="confirm_new_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    className="h-12 rounded-[10px] focus-visible:ring-0 focus-visible:border-custom-base-green"
                  />
                  {showConfirmPassword ? (
                    <EyeIcon
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-custom-grey-600 cursor-pointer"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  ) : (
                    <EyeOffIcon
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-custom-grey-600 cursor-pointer"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  )}
                </div>
              </Field>
              <Field>
                {state && !state.success && (
                  <p className="text-red-500 text-sm mb-2">{state.error}</p>
                )}
                <Button type="submit" className="w-full h-11 cursor-pointer" disabled={isPending}>
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </div>
    </div >
  );
}

function MobileRedirectLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-custom-base-green mx-auto" />
        <p className="text-gray-600 text-sm">
          Launching the mobile app…
        </p>
        <p className="text-gray-500 text-xs">
          If nothing happens, the reset form will appear shortly.
        </p>
      </div>
    </div>
  )
}

function ResetPasswordFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-custom-base-green" />
        <p className="text-gray-600">Loading reset password form…</p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  )
}