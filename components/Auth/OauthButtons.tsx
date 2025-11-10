import Image from "next/image";
import { Button } from "../ui/button";
import { useOAuth } from "@/core/api/auth/oauth/queries";
import type { OAuthRequest } from "@/core/api/auth/oauth/types";
import { toast } from "sonner";
import { useState } from "react";

export default function OauthButtons() {
    const { mutateAsync, isPending } = useOAuth()
    const [clickedProvider, setClickedProvider] = useState<string | null>(null)
    
    /**
     * Handle OAuth provider button click
     * Uses window.location.href for external redirects (better for OAuth flows)
     * This avoids Next.js router issues with external URLs
     */
    async function handleOnClick(provider: string) {
        // Prevent multiple clicks
        if (isPending || clickedProvider) return
        
        setClickedProvider(provider)
        
        const requestBody: OAuthRequest = {
            provider: provider,
            redirect_uri: typeof window !== 'undefined' 
                ? window.location.origin + "/auth/callback"
                : "",
        }
        
        try {
            const response = await mutateAsync(requestBody)
            
            // Use window.location.href for external OAuth redirects
            // This is the proper way to redirect to external authorization URLs
            // router.push() is for internal navigation only
            if (typeof window !== 'undefined' && response.authorization_url) {
                window.location.href = response.authorization_url
            }
        } catch (error) {
            console.error("OAuth error:", error)
            toast.error("Failed to initiate OAuth flow. Please try again.")
            setClickedProvider(null)
        }
    }
  return (
    <div className="flex justify-center gap-4">
        <Button
            className="h-12 w-[180px] cursor-pointer flex items-center justify-center gap-2 rounded-[10px] "
            variant="outline"
            onClick={() => handleOnClick("GoogleOAuth")}
            disabled={isPending || clickedProvider === "GoogleOAuth"}
            type="button"
        >
            <Image
            src="/logo/google.png"
            alt="Google"
            width={20}
            height={20}
            />
            Google
        </Button>
        <Button
            className="h-12 w-[180px] cursor-pointer flex items-center justify-center gap-2 rounded-[10px] "
            variant="outline"
            onClick={() => handleOnClick("AppleOAuth")}
            disabled={isPending || clickedProvider === "AppleOAuth"}
            type="button"
        >
            <Image src="/logo/apple.png" alt="Apple" width={20} height={20} />
            Apple
        </Button>
    </div>
  )
}