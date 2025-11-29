/**
 * Type definitions for external API responses
 */

// Weather & Climate Data
export interface WeatherData {
  temperature: number
  humidity: number
  pressure?: number
  windSpeed?: number
  description?: string
  feelsLike?: number
}

export interface ClimateData {
  city: string
  temperature: number
  humidity: number
  aqi: number
  weatherCondition: string
  climateRisk: 'Low' | 'Moderate' | 'High' | 'Critical'
  seasonalRisks: string[]
  timestamp: string
  sources: {
    weather: string
    aqi: string
  }
}

// Health Statistics
export interface DeathRateData {
  country: string
  region?: string
  city?: string
  overallDeathRate: number // per 1000 population
  ageAdjustedRate: number
  year: number
  source: string
  confidence: 'high' | 'medium' | 'low'
}

export interface OccupationDeathRateData {
  occupation: string
  deathRate: number // per 100,000 workers
  injuryRate: number
  fatalityRate: number
  year: number
  source: string
  confidence: 'high' | 'medium' | 'low'
}

// Crime & Safety Data
export interface CrimeData {
  city: string
  crimeRate: number // per 100,000 population
  violentCrimeRate: number
  propertyCrimeRate: number
  safetyIndex: number
  year: number
  source: string
  recentIncidents?: number
  trend: 'increasing' | 'stable' | 'decreasing'
}

// Health Alerts & News
export interface HealthAlert {
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  location: string
  date: string
  source: string
  url?: string
}

// Disease Prevalence
export interface DiseasePrevalenceData {
  disease: string
  prevalence: number // per 100,000 population
  region: string
  year: number
  riskFactors: string[]
  source: string
}

// Healthcare Infrastructure
export interface HealthcareInfrastructure {
  city: string
  hospitalsCount: number
  bedsPerThousand: number
  doctorsPerThousand: number
  healthcareQualityIndex: number
  emergencyResponseTime: number // in minutes
  source: string
}

// Aggregated Real-Time Data
export interface RealTimeData {
  climate: ClimateData
  deathRate: DeathRateData
  occupationDeathRate: OccupationDeathRateData
  crime: CrimeData
  healthAlerts: HealthAlert[]
  diseasePrevalence: DiseasePrevalenceData[]
  healthcareInfra?: HealthcareInfrastructure
  timestamp: string
  dataQuality: {
    overall: 'excellent' | 'good' | 'fair' | 'poor'
    sources: number
    realTimeDataPercentage: number
  }
}

// API Response Wrappers
export interface APIResponse<T> {
  success: boolean
  data: T
  error?: string
  source: string
  timestamp: string
  cached: boolean
}

// World Bank API Response
export interface WorldBankResponse {
  page: number
  pages: number
  per_page: number
  total: number
  data?: Array<{
    indicator: {
      id: string
      value: string
    }
    country: {
      id: string
      value: string
    }
    value: number | null
    date: string
  }>
}

// OpenWeatherMap API Response
export interface OpenWeatherMapResponse {
  coord: {
    lon: number
    lat: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  wind: {
    speed: number
    deg: number
  }
  clouds: {
    all: number
  }
  dt: number
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
  name: string
}

// NewsAPI Response
export interface NewsAPIResponse {
  status: string
  totalResults: number
  articles: Array<{
    source: {
      id: string | null
      name: string
    }
    author: string | null
    title: string
    description: string
    url: string
    urlToImage: string | null
    publishedAt: string
    content: string
  }>
}

// AQICN Response
export interface AQICNResponse {
  status: string
  data: {
    aqi: number
    idx: number
    city: {
      name: string
      geo: [number, number]
      url: string
    }
    dominentpol: string
    iaqi: {
      [key: string]: {
        v: number
      }
    }
    time: {
      s: string
      tz: string
      v: number
    }
  }
}
