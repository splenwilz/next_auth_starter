  import { useMutation, useQueryClient } from "@tanstack/react-query";
  import { oauth } from "./services";
  import type { OAuthRequest } from "./types";

/**
 * Hook to initiate OAuth flow
 * 
 * React Query v5 pattern: Returns mutation and queryClient for component-level handling.
 * Components should handle cache invalidation using mutation state without useEffect.
 * 
 * @returns React Query mutation object and queryClient for cache management
 * @see https://tanstack.com/query/latest/docs/react/guides/migrating-to-v5
 * @see https://tanstack.com/query/latest/docs/react/reference/useMutation
 */
export function useOAuth() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (data: OAuthRequest) => oauth(data),
  });

  return {
    ...mutation,
    queryClient,
  };
}

