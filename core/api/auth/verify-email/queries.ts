  import { useMutation, useQueryClient } from "@tanstack/react-query";
  import { verifyEmail } from "./services";
  import type { VerifyEmailRequest } from "./types";

/**
 * Hook to verify email of an existing user
 * 
 * React Query v5 pattern: Returns mutation and queryClient for component-level handling.
 * Components should handle cache invalidation using mutation state without useEffect.
 * 
 * @returns React Query mutation object and queryClient for cache management
 * @see https://tanstack.com/query/latest/docs/react/guides/migrating-to-v5
 * @see https://tanstack.com/query/latest/docs/react/reference/useMutation
 */
export function useVerifyEmail() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (data: VerifyEmailRequest) => verifyEmail(data),
  });

  return {
    ...mutation,
    queryClient,
  };
}

