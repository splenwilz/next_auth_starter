// "use client"

// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import { toast } from "sonner"
// import { Button } from "@/components/ui/button"
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { useSignup } from "@/core/api/auth/signup/queries"
// import type { SignupRequest } from "@/core/api/auth/signup/types"
// import Image from "next/image"
// import Link from "next/link"
// import { Label } from "../ui/label"
// import { useState } from "react"
// import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
// import { Checkbox } from "../ui/checkbox"
// import { useRouter } from "next/navigation"
// import { useSignin } from "@/core/api/auth/signin/queries"
// import type { EmailVerificationResponse } from "@/core/api/auth/signin/types"
// import OauthButtons from "./OauthButtons"

// /**
//  * Form schema for signup
//  * Uses camelCase for form fields, will be transformed to snake_case for API
//  */
// const formSchema = z.object({
//   firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
//   lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
//   email: z.email({ message: "Invalid email address" }),
//   password: z.string().min(8, "Password must be at least 8 characters"),
//   confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ["confirmPassword"],
// })

// export default function SignupForm() {
//   const { mutateAsync: signupMutateAsync, isPending: isSignupPending } = useSignup()
//   const { mutateAsync: signinMutateAsync, isPending: isSigninPending } = useSignin()
//   const router = useRouter()
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false)

//   const isPending = isSignupPending || isSigninPending

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       firstName: "",
//       lastName: "",
//       email: "",
//       password: "",
//       confirmPassword: "",
//     },
//   })

//   /**
//    * Handle form submission
//    * Transforms camelCase form data to snake_case for API
//    * Handles success/error and cache invalidation without useEffect
//    */
//   async function onSubmit(values: z.infer<typeof formSchema>) {
//     // Transform camelCase to snake_case for backend API
//     // Backend expects: first_name, last_name, confirm_password
//     const requestBody: SignupRequest = {
//       first_name: values.firstName,
//       last_name: values.lastName,
//       email: values.email,
//       password: values.password,
//       confirm_password: values.confirmPassword,
//     }

//     try {
//       // Step 1: Sign up the user
//       await signupMutateAsync(requestBody)

//       // Store email in sessionStorage for use in confirm email page
//       // Using sessionStorage as it's temporary and cleared when tab closes
//       if (typeof window !== 'undefined') {
//         sessionStorage.setItem('pending_verification_email', values.email)
//       }

//       // Handle success: show toast, reset form
//       toast.success("Account created successfully!")
//       form.reset()

//       // Step 2: Sign in to get pending_authentication_token if email verification is required
//       try {
//         const signinResponse = await signinMutateAsync({
//           email: values.email,
//           password: values.password,
//         })

//         // Check if response is EmailVerificationResponse
//         // EmailVerificationResponse has pending_authentication_token and requires_verification
//         if (
//           signinResponse &&
//           typeof signinResponse === 'object' &&
//           'pending_authentication_token' in signinResponse &&
//           'requires_verification' in signinResponse &&
//           (signinResponse as EmailVerificationResponse).requires_verification
//         ) {
//           // Extract pending_authentication_token and add it to redirect URL
//           const emailVerificationResponse = signinResponse as EmailVerificationResponse
//           const token = emailVerificationResponse.pending_authentication_token
//           // Include email in URL as fallback
//           router.push(`/confirm-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(values.email)}`)
//         } else {
//           // If no email verification required, redirect to confirm email page without token
//           router.push(`/confirm-email?email=${encodeURIComponent(values.email)}`)
//         }
//       } catch (signinErr) {
//         // If signin fails, redirect to login page with email as search param
//         // User can manually sign in to complete the verification process
//         console.error("Signin after signup failed:", signinErr)
//         router.push(`/signin?email=${encodeURIComponent(values.email)}`)
//       }
//     } catch (err) {
//       // Error messages are already user-friendly from apiClient
//       const errorMessage = err instanceof Error
//         ? err.message
//         : "Failed to create account. Please try again."
//       toast.error(errorMessage)
//     }
//   }
//   return (
//     <div className="flex flex-col w-full justify-between">
//       <Form {...form}>
//         <form
//           onSubmit={form.handleSubmit(onSubmit)}
//           className="space-y-8 w-full p-14 lg:p-20 pb-0 max-w-[680px] mx-auto"
//         >
//           {/* Sign up header */}
//           <div className="flex flex-col mt-2 mb-10">
//             <h3 className="text-3xl font-bold font-manrope">
//               Create your account
//             </h3>
//             <p className=" text-grey-900 mt-5 text-lg font-manrope">Get started for free today!</p>
//           </div>
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 mt-10">
//             {/* First name */}
//             <FormField
//               control={form.control}
//               name="firstName"
//               render={({ field }) => (
//                 <FormItem className="w-full">
//                   <FormLabel>
//                     First Name <span className="text-red-500">*</span>
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       className="h-12 rounded-[10px] focus-visible:ring-0 focus-visible:border-custom-base-green w-full"
//                       placeholder="Enter your first name"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="lastName"
//               render={({ field }) => (
//                 <FormItem className="w-full">
//                   <FormLabel>
//                     Last Name <span className="text-red-500">*</span>
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       className="h-12 rounded-[10px] focus-visible:ring-0 focus-visible:border-custom-base-green w-full"
//                       placeholder="Enter your last name"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>
//           <FormField
//             control={form.control}
//             name="email"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>
//                   Email <span className="text-red-500">*</span>
//                 </FormLabel>

//                 <FormControl>
//                   <Input
//                     className="h-12 rounded-[10px] focus-visible:ring-0 focus-visible:border-custom-base-green"
//                     placeholder="Enter your email"
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 mt-10">
//             <FormField
//               control={form.control}
//               name="password"
//               render={({ field }) => (
//                 <FormItem className="w-full">
//                   <FormLabel>
//                     Password <span className="text-red-500">*</span>
//                   </FormLabel>
//                   <FormControl>
//                     <div className="relative w-full">
//                       <Input
//                         className="h-12 rounded-[10px] focus-visible:ring-0 focus-visible:border-custom-base-green pr-12 w-full"
//                         placeholder="Enter your password"
//                         {...field}
//                         type={showPassword ? 'text' : 'password'}
//                       />
//                       {showPassword ? (
//                         <EyeIcon
//                           className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-custom-grey-600 cursor-pointer"
//                           onClick={() => setShowPassword(!showPassword)}
//                         />
//                       ) : (
//                         <EyeOffIcon
//                           className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-custom-grey-600 cursor-pointer"
//                           onClick={() => setShowPassword(!showPassword)}
//                         />
//                       )}
//                     </div>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="confirmPassword"
//               render={({ field }) => (
//                 <FormItem className="w-full">
//                   <FormLabel>
//                     Confirm Password <span className="text-red-500">*</span>
//                   </FormLabel>
//                   <FormControl>
//                     <div className="relative w-full">
//                       <Input
//                         className="h-12 rounded-[10px] focus-visible:ring-0 focus-visible:border-custom-base-green pr-12 w-full"
//                         placeholder="Re-enter your password"
//                         {...field}
//                         type={showConfirmPassword ? 'text' : 'password'}
//                       />
//                       {showConfirmPassword ? (
//                         <EyeIcon
//                           className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-custom-grey-600 cursor-pointer"
//                           onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                         />
//                       ) : (
//                         <EyeOffIcon
//                           className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-custom-grey-600 cursor-pointer"
//                           onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                         />
//                       )}
//                     </div>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>
//           {/* Remember me and Forgot password */}
//           <div className="flex justify-between">
//             <div className="flex items-center">
//               <Checkbox />
//               <Label
//                 htmlFor="remember-me"
//                 className="text-sm ml-2 text-custom-grey-600 "
//               >
//                 Remember me
//               </Label>
//             </div>
//             <Link href="/forgot-password" className="text-sm text-custom-grey-600 ">
//               Forgot password?
//             </Link>
//           </div>
//           <Button
//             className="w-full h-14 cursor-pointer rounded-[10px] bg-[#F1F2F4] hover:bg-custom-grey-900 text-[#A0AEC0] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//             type="submit"
//             disabled={isPending}
//           >
//             {isPending ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Creating Account...
//               </>
//             ) : (
//               'Create Account'
//             )}
//           </Button>

//           {/* Or register with */}
//           <div className="flex justify-center mt-4">
//             <div className="w-full h-1 border-t border-[#E2E8F0]"></div>
//             <span className="text-sm text-custom-grey-600 w-full text-center -mt-2">
//               Or register with
//             </span>
//             <div className="w-full h-1 border-t border-[#E2E8F0]"></div>
//           </div>
//           {/* Google login and Apple login */}
//           <OauthButtons />


//           {/* Already have an account? */}
//           <div className="flex  ">
//             <p className="text-sm text-custom-grey-600">
//               Already have an account?{' '}
//               <Link
//                 href="/signin"
//                 className="text-custom-base-green font-medium"
//               >
//                 Sign in
//               </Link>
//             </p>
//           </div>
//         </form>
//       </Form>
//       {/* Terms and conditions */}
//       <div className="flex w-full mt-20 p-20 pb-0 max-w-[700px] mx-auto">
//         <div className="flex flex-col xl:flex-row justify-between items-center gap-2 w-full mb-10">
//           <p className="text-sm text-custom-grey-600">
//             © 2023 Humanline . All rights reserved.{' '}
//           </p>
//           <div className="flex gap-10">
//             <Link href="/terms" className="text-black text-sm font-medium ">
//               Terms and Conditions
//             </Link>

//             <Link href="/privacy" className="text-black text-sm font-medium">
//               Privacy Policy
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }






"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { SignupActionResult } from "@/core/api/auth/signup/actions"
import { signupAction } from "@/core/api/auth/signup/actions"
import type { EmailVerificationResponse } from "@/core/api/auth/signin/types"
import Link from "next/link"
import { Label } from "../ui/label"
import { useState } from "react"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { Checkbox } from "../ui/checkbox"
import OauthButtons from "./OauthButtons"

/**
 * Form schema for signup
 * Uses camelCase for form fields, will be transformed to snake_case for API
 */
const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function SignupForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Use useActionState for server action
  const [state, formAction, isPending] = useActionState<SignupActionResult | null, FormData>(
    signupAction,
    null
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  // Handle server action result
  useEffect(() => {
    if (!state) return

    if (state.success) {
      const { signinResponse, email } = state.data

      // Store email in sessionStorage for confirm email page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_verification_email', email)
      }

      toast.success("Account created successfully!")
      form.reset()

      // Handle signin response if available
      if (signinResponse) {
        // Check if email verification is required
        if (
          signinResponse &&
          typeof signinResponse === 'object' &&
          'pending_authentication_token' in signinResponse &&
          'requires_verification' in signinResponse &&
          (signinResponse as EmailVerificationResponse).requires_verification
        ) {
          const token = (signinResponse as EmailVerificationResponse).pending_authentication_token
          router.push(`/confirm-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
        } else {
          router.push(`/confirm-email?email=${encodeURIComponent(email)}`)
        }
      } else {
        // If auto signin failed, redirect to signin page
        router.push(`/signin?email=${encodeURIComponent(email)}`)
      }
    } else {
      toast.error(state.error)
    }
  }, [state, router, form])

  return (
    <div className="flex flex-col w-full justify-between">
      <Form {...form}>
        <form
          action={formAction}
          className="space-y-8 w-full p-14 lg:p-20 pb-0 max-w-[680px] mx-auto"
        >
          {/* Sign up header */}
          <div className="flex flex-col mt-2 mb-10">
            <h3 className="text-3xl font-bold font-manrope">
              Create your account
            </h3>
            <p className=" text-grey-900 mt-5 text-lg font-manrope">Get started for free today!</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 mt-10">
            {/* First name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    First Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-12 rounded-[10px] focus-visible:ring-0 focus-visible:border-custom-base-green w-full"
                      placeholder="Enter your first name"
                      {...field}
                      name="firstName"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Last Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-12 rounded-[10px] focus-visible:ring-0 focus-visible:border-custom-base-green w-full"
                      placeholder="Enter your last name"
                      {...field}
                      name="lastName"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span className="text-red-500">*</span>
                </FormLabel>

                <FormControl>
                  <Input
                    className="h-12 rounded-[10px] focus-visible:ring-0 focus-visible:border-custom-base-green"
                    placeholder="Enter your email"
                    {...field}
                    name="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 mt-10">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Password <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        className="h-12 rounded-[10px] focus-visible:ring-0 focus-visible:border-custom-base-green pr-12 w-full"
                        placeholder="Enter your password"
                        {...field}
                        type={showPassword ? 'text' : 'password'}
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Confirm Password <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        className="h-12 rounded-[10px] focus-visible:ring-0 focus-visible:border-custom-base-green pr-12 w-full"
                        placeholder="Re-enter your password"
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Remember me and Forgot password */}
          <div className="flex justify-between">
            <div className="flex items-center">
              <Checkbox />
              <Label
                htmlFor="remember-me"
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
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          {/* Or register with */}
          <div className="flex justify-center mt-4">
            <div className="w-full h-1 border-t border-[#E2E8F0]"></div>
            <span className="text-sm text-custom-grey-600 w-full text-center -mt-2">
              Or register with
            </span>
            <div className="w-full h-1 border-t border-[#E2E8F0]"></div>
          </div>
          {/* Google login and Apple login */}
          <OauthButtons />

          {/* Already have an account? */}
          <div className="flex  ">
            <p className="text-sm text-custom-grey-600">
              Already have an account?{' '}
              <Link
                href="/signin"
                className="text-custom-base-green font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </Form>
      {/* Terms and conditions */}
      <div className="flex w-full mt-20 p-20 pb-0 max-w-[700px] mx-auto">
        <div className="flex flex-col xl:flex-row justify-between items-center gap-2 w-full mb-10">
          <p className="text-sm text-custom-grey-600">
            © 2023 Humanline . All rights reserved.{' '}
          </p>
          <div className="flex gap-10">
            <Link href="/terms" className="text-black text-sm font-medium ">
              Terms and Conditions
            </Link>

            <Link href="/privacy" className="text-black text-sm font-medium">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}