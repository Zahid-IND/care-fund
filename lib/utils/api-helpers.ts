/**
 * API Helper Utilities
 * Provides retry logic, timeout handling, and error management
 */

import { APIConfig } from '@/lib/config/api-config'

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public apiName?: string,
    public originalError?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError('Request timeout', 408, 'unknown', error)
    }
    throw error
  }
}

/**
 * Retry logic with exponential backoff
 */
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  config: APIConfig,
  apiName: string
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= config.retryAttempts; attempt++) {
    try {
      console.log(`[API] ${apiName} - Attempt ${attempt + 1}/${config.retryAttempts + 1}: ${url}`)

      const response = await fetchWithTimeout(url, options, config.timeout)

      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new APIError(
          `HTTP ${response.status}: ${errorText}`,
          response.status,
          apiName
        )
      }

      // Parse JSON response
      const data = await response.json()
      console.log(`[API] ${apiName} - Success`)
      return data as T

    } catch (error) {
      lastError = error as Error
      console.error(`[API] ${apiName} - Attempt ${attempt + 1} failed:`, error)

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error instanceof APIError && error.statusCode) {
        if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
          throw error
        }
      }

      // If not the last attempt, wait before retrying
      if (attempt < config.retryAttempts) {
        const delay = config.retryDelay * Math.pow(2, attempt) // Exponential backoff
        console.log(`[API] ${apiName} - Retrying in ${delay}ms...`)
        await sleep(delay)
      }
    }
  }

  // All attempts failed
  throw new APIError(
    `Failed after ${config.retryAttempts + 1} attempts: ${lastError?.message}`,
    undefined,
    apiName,
    lastError
  )
}

/**
 * Safe API call with fallback
 */
export async function safeAPICall<T>(
  fetchFn: () => Promise<T>,
  fallbackValue: T,
  apiName: string
): Promise<{ data: T; fromCache: boolean; error?: string }> {
  try {
    const data = await fetchFn()
    return { data, fromCache: false }
  } catch (error) {
    console.error(`[API] ${apiName} - Using fallback:`, error)
    return {
      data: fallbackValue,
      fromCache: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Validate API response structure
 */
export function validateResponse<T>(
  data: any,
  requiredFields: string[],
  apiName: string
): T {
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new APIError(
        `Invalid response: missing field '${field}'`,
        undefined,
        apiName
      )
    }
  }
  return data as T
}

/**
 * Build query string from parameters
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })
  
  return searchParams.toString()
}

/**
 * Parse error message from various error types
 */
export function parseErrorMessage(error: any): string {
  if (error instanceof APIError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Unknown error occurred'
}

/**
 * Log API call metrics
 */
export function logAPIMetrics(
  apiName: string,
  startTime: number,
  success: boolean,
  error?: string
): void {
  const duration = Date.now() - startTime
  const status = success ? 'SUCCESS' : 'FAILED'
  
  console.log(`[API Metrics] ${apiName} - ${status} - ${duration}ms${error ? ` - ${error}` : ''}`)
}
