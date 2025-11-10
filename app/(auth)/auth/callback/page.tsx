import { redirect } from "next/navigation";
import { oauthCallback } from "@/core/api/auth/oauth/services";

export default async function AuthCallback(
    { searchParams }: { searchParams: Promise<{ code?: string, state?: string }> }
) {
  const { code, state } = await searchParams
  if (!code) {
    redirect("/signin")
  }
  // const result = await handleAuthCallback(code)
  try {
    const result = await oauthCallback({ code, state: state ?? undefined })
    // store user in session storage
  } catch (error) {
    console.error(error)
    redirect("/signin")
  }  
  redirect("/dashboard")
}