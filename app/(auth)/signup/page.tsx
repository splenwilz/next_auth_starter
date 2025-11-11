
import SignupForm from "@/components/Auth/SignupForm";
import Image from "next/image";


export default function Signup() {
  return (
    <div className="flex min-h-screen ">
      <div className="w-full lg:w-1/2 flex justify-center ">
        <SignupForm />
      </div>
      <div className="w-1/2  hidden lg:flex  flex-col bg-custom-base-green relative ">
        <Image src="/images/star.png" className=" top-0 absolute left-0 z-10" alt="star" width={500} height={500} />
        <div className="relative z-20">
          <div className="p-20 pb-10">
            <h1 className="text-white text-4xl font-medium w-[400px]">
              Secure authentication made simple.
            </h1>
            <p className="text-white mt-4">
              Get started with Next Auth Starter and build secure user authentication quickly
            </p>
          </div>
          <div className="relative pl-20">
            <Image
              src="/images/signupimg.png"
              className="w-full object-cover rounded-lg z-50"
              alt="signupimg"
              width={500}
              height={500}
            />
          </div>
        </div>
      </div>
    </div>
  );
}