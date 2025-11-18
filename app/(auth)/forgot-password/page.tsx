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
import { forgotPasswordAction, type ForgotPasswordActionResult } from "@/core/api/auth/forgot-password/actions";
import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ForgotPassword() {
    const router = useRouter()
    const [state, formAction, isPending] = useActionState<ForgotPasswordActionResult | null, FormData>(
        forgotPasswordAction,
        null
    )

    useEffect(() => {
        if (!state) return

        if (state.success) {
            toast.success(state.message)
            // router.push('/reset-password')
        } else {
            // Show server-side validation errors
            toast.error(state.error)
        }
    }, [state])
    return (
        <>

            {state?.success && (
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
                            Password reset instructions sent!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            We have sent a password reset instructions to your email address. Please check your email.
                        </p>

                        {/* Loading indicator */}
                        <div className="flex flex-col items-center space-y-4 mb-6">
                            <div className="animate-bounce rounded-full h-8 w-8 border-b-2 border-custom-base-green"></div>
                            <p className="text-sm text-gray-500">
                                Please check your email for the password reset instructions.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Button onClick={() => router.push('/signin')} className="w-full cursor-pointer">
                                Back to Signin
                            </Button>
                            <Button
                                onClick={() => router.push('/')}
                                variant="outline"
                                className="w-full cursor-pointer"
                            >
                                Back to Home
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {(!state || !state?.success) && (
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
                                Reset your password
                            </h2>
                            <p className="text-gray-600 text-[16px] leading-8">
                                Enter your email address and we’ll send you password reset instructions.
                            </p>
                        </div>
                        <form action={formAction} className="w-full">
                            <FieldSet>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="email">Registered Email <span className="text-red-500">*</span></FieldLabel>
                                        <Input
                                            autoComplete="off"
                                            name="email"
                                            type="email"
                                            placeholder="Enter your email address"
                                            className="h-12 rounded-[10px] focus-visible:ring-0 focus-visible:border-custom-base-green"
                                        />
                                    </Field>
                                    <Field>
                                        <Button type="submit" className="w-full h-11 cursor-pointer" disabled={isPending}>
                                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
                                        </Button>
                                        <Button type="button" variant="outline" className="w-full h-11 cursor-pointer" disabled={isPending} onClick={() => router.push('/signin')}>
                                            Back to Signin
                                        </Button>
                                    </Field>
                                </FieldGroup>
                            </FieldSet>
                        </form>
                    </div>
                </div >
            )}
        </>
    )
}