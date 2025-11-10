import { apiClient } from "../../client";
import { AuthResponse } from "../types";
  import type { OAuthCallbackRequest, OAuthResponse } from "./types";
  import type { OAuthRequest } from "./types";

/**
 * Initiate OAuth flow
 * @param data - User oauth request
 * @returns Promise resolving to oauth response
 * @see https://tanstack.com/query/latest/docs/react/guides/mutations
 */
export async function oauth(data: OAuthRequest): Promise<OAuthResponse> {
  const response = await apiClient<OAuthResponse>("/api/v1/auth/authorize", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response;
}

export async function oauthCallback(data: OAuthCallbackRequest): Promise<AuthResponse> {
  const response = await apiClient<AuthResponse>("/api/v1/auth/callback", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response;
}