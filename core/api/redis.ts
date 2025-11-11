/**
 * Upstash Redis client for rate limiting
 * Uses REST API (serverless-friendly, works everywhere)
 * 
 * @see https://upstash.com/docs/redis/overall/getstarted
 */

import { Redis } from '@upstash/redis'

/**
 * Redis client instance
 * Uses environment variables for authentication
 * 
 * Environment variables required:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error(
        'Missing required environment variables: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN'
    )
}

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
})