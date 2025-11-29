/**
 * API Configuration and Management
 * Centralized configuration for all external APIs
 */

export interface APIConfig {
  baseUrl: string
  timeout: number
  retryAttempts: number
  retryDelay: number
  cacheTTL: number // in seconds
  requiresAuth: boolean
}

export const API_CONFIGS = {
  // Weather APIs
  openMeteo: {
    baseUrl: 'https://api.open-meteo.com/v1',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
    cacheTTL: 3600, // 1 hour
    requiresAuth: false
  },
  
  openWeatherMap: {
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
    cacheTTL: 3600, // 1 hour
    requiresAuth: true
  },
  
  // Air Quality
  aqicn: {
    baseUrl: 'https://api.waqi.info',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
    cacheTTL: 3600, // 1 hour
    requiresAuth: true
  },
  
  // Health & Statistics
  worldBank: {
    baseUrl: 'https://api.worldbank.org/v2',
    timeout: 15000,
    retryAttempts: 3,
    retryDelay: 1000,
    cacheTTL: 86400, // 24 hours (data doesn't change frequently)
    requiresAuth: false
  },
  
  // News & Alerts
  newsApi: {
    baseUrl: 'https://newsapi.org/v2',
    timeout: 10000,
    retryAttempts: 2,
    retryDelay: 1000,
    cacheTTL: 7200, // 2 hours
    requiresAuth: true
  },
  
  // Indian Government Data
  dataGovIn: {
    baseUrl: 'https://api.data.gov.in',
    timeout: 15000,
    retryAttempts: 3,
    retryDelay: 1000,
    cacheTTL: 86400, // 24 hours
    requiresAuth: true
  }
} as const

/**
 * Get API keys from environment variables
 */
export function getAPIKeys() {
  return {
    aqicn: process.env.AQICN_API_KEY || '',
    openWeatherMap: process.env.OPENWEATHER_API_KEY || '',
    newsApi: process.env.NEWS_API_KEY || '',
    dataGovIn: process.env.DATA_GOV_IN_API_KEY || '',
    gemini: process.env.GEMINI_API_KEY || ''
  }
}

/**
 * Check if API key is configured
 */
export function isAPIKeyConfigured(apiName: keyof ReturnType<typeof getAPIKeys>): boolean {
  const keys = getAPIKeys()
  return !!keys[apiName] && keys[apiName].length > 0
}

/**
 * Get API configuration
 */
export function getAPIConfig(apiName: keyof typeof API_CONFIGS): APIConfig {
  return API_CONFIGS[apiName]
}

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  openWeatherMap: {
    requestsPerMinute: 60,
    requestsPerDay: 1000
  },
  newsApi: {
    requestsPerMinute: 5,
    requestsPerDay: 100
  },
  aqicn: {
    requestsPerMinute: 60,
    requestsPerDay: 1000
  }
} as const
