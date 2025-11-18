
import { Suspense } from 'react'
import SigninForm from '@/components/Auth/SigninForm'
import Image from 'next/image'

function SigninFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-16 w-full">
      <div className="h-8 w-8 rounded-full border-2 border-custom-base-green border-t-transparent animate-spin" />
      <p className="text-gray-600 mt-4">Loading signin form…</p>
    </div>
  )
}

export default function Signin() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="lg:w-1/2 h-full hidden lg:flex flex-col">
        <div className="flex justify-center items-center h-[65vh]">
          <Image
            src="/images/onboarding.png"
            className="w-full h-full object-cover"
            alt="onboarding"
            width={500}
            height={500}
          />
        </div>
        <div className="flex flex-col p-14 h-[35vh] bg-custom-grey-900 border-t-4 border-t-custom-base-green">
          <Image
            src="/logo/humanline.png"
            alt="logo"
            width={150}
            height={150}
          />
          <h1 className="text-white text-5xl leading-14 font-bold mt-7">
            Let’s empower your employees today.
          </h1>
          <p className="text-white text-lg mt-6">
            We help to complete all your conveyancing needs easily
          </p>
        </div>
      </div>
      <div className="lg:w-1/2 w-full h-full flex justify-center">
        <Suspense fallback={<SigninFallback />}>
          <SigninForm />
        </Suspense>
      </div>
    </div>
  )
}
