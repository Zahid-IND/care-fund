import axios from "axios"
import { getCityStatistics, calculateCrimeStressImpact } from "@/lib/data/crime-statistics"
import { getOccupationHazard } from "@/lib/data/occupation-hazards"
import { fetchAllRealTimeData } from "./real-time-data-fetcher"
import { RealTimeData } from "@/lib/types/api-responses"

export interface CollectedData {
  environmental: {
    city: string
    aqi: number
    temperature: number
    humidity: number
    climateRisk: string
    weatherCondition?: string
    seasonalRisks?: string[]
    timestamp: string
    source: any
  }
  statistical: {
    deathRate: number
    crimeRate: number
    occupationHazardLevel: string
    occupationDeathRate: number
    cityHealthIndex: number
    ageAdjustedDeathRate?: number
    violentCrimeRate?: number
    safetyIndex?: number
  }
  occupationHazard: any
  cityStats: any
  realTimeData?: RealTimeData
  healthAlerts?: any[]
  dataQuality?: {
    overall: 'excellent' | 'good' | 'fair' | 'poor'
    sources: number
    realTimeDataPercentage: number
  }
}

/**
 * Fetch environmental data (AQI, weather, climate)
 */
export async function fetchEnvironmentalData(city: string): Promise<CollectedData["environmental"]> {
  try {
    // Use the existing environment API
    const response = await axios.get(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/environment?city=${city}`)
    
    const data = response.data
    
    // Determine climate risk based on AQI
    let climateRisk = "Low"
    if (data.aqi > 200) climateRisk = "Critical"
    else if (data.aqi > 150) climateRisk = "High"
    else if (data.aqi > 100) climateRisk = "Moderate"
    
    return {
      city: data.city,
      aqi: data.aqi,
      temperature: data.temperature,
      humidity: data.humidity,
      climateRisk,
      timestamp: data.timestamp,
      source: data.source
    }
  } catch (error) {
    console.error("[DataCollector] Environmental data fetch error:", error)
    // Return fallback data
    return {
      city,
      aqi: 150,
      temperature: 30,
      humidity: 65,
      climateRisk: "Moderate",
      timestamp: new Date().toISOString(),
      source: { weather: "Fallback", aqi: "Estimated" }
    }
  }
}

/**
 * Fetch death rate data from WHO or use estimates
 */
export async function fetchDeathRateData(city: string, age: number): Promise<number> {
  try {
    // WHO Global Health Observatory API
    // For now, using estimated data based on Indian statistics
    
    // Age-adjusted death rate per 1000 population
    let baseRate = 7.3 // India average
    
    // Adjust for age
    if (age > 60) baseRate *= 2.5
    else if (age > 50) baseRate *= 1.8
    else if (age > 40) baseRate *= 1.3
    else if (age > 30) baseRate *= 1.0
    else baseRate *= 0.7
    
    // City-specific adjustments (based on healthcare infrastructure)
    const cityMultipliers: Record<string, number> = {
      "Mumbai": 0.9,
      "Delhi": 1.0,
      "Bangalore": 0.85,
      "Hyderabad": 0.9,
      "Chennai": 0.88,
      "Kolkata": 1.05,
      "Pune": 0.87,
      "Ahmedabad": 0.95,
      "Jaipur": 1.0,
      "Lucknow": 1.05
    }
    
    const multiplier = cityMultipliers[city] || 1.0
    return Math.round(baseRate * multiplier * 10) / 10
  } catch (error) {
    console.error("[DataCollector] Death rate fetch error:", error)
    return 7.3 // India average
  }
}

/**
 * Calculate city health index
 */
export function calculateCityHealthIndex(
  aqi: number,
  crimeRate: number,
  temperature: number
): number {
  let index = 100
  
  // AQI impact (0-50 points deduction)
  if (aqi > 200) index -= 50
  else if (aqi > 150) index -= 35
  else if (aqi > 100) index -= 20
  else if (aqi > 50) index -= 10
  
  // Crime rate impact (0-30 points deduction)
  if (crimeRate > 1000) index -= 30
  else if (crimeRate > 500) index -= 20
  else if (crimeRate > 300) index -= 10
  else if (crimeRate > 150) index -= 5
  
  // Temperature extremes (0-20 points deduction)
  if (temperature > 40 || temperature < 10) index -= 20
  else if (temperature > 35 || temperature < 15) index -= 10
  
  return Math.max(index, 0)
}

/**
 * Collect all data for Agent 1 with enhanced real-time data
 */
export async function collectAllData(
  city: string,
  occupation: string,
  age: number
): Promise<CollectedData> {
  try {
    console.log(`[DataCollector] Starting enhanced data collection for ${city}, ${occupation}, age ${age}`)
    
    // Fetch comprehensive real-time data
    const realTimeData = await fetchAllRealTimeData(city, occupation, age)
    
    // Get city statistics (local data as backup)
    const cityStats = getCityStatistics(city)
    
    // Get occupation hazard data (local data as backup)
    const occupationHazard = getOccupationHazard(occupation)
    
    // Merge real-time climate data with environmental data
    const environmental = {
      city: realTimeData.climate.city,
      aqi: realTimeData.climate.aqi,
      temperature: realTimeData.climate.temperature,
      humidity: realTimeData.climate.humidity,
      climateRisk: realTimeData.climate.climateRisk,
      weatherCondition: realTimeData.climate.weatherCondition,
      seasonalRisks: realTimeData.climate.seasonalRisks,
      timestamp: realTimeData.climate.timestamp,
      source: realTimeData.climate.sources
    }
    
    // Calculate city health index with real-time data
    const cityHealthIndex = calculateCityHealthIndex(
      environmental.aqi,
      realTimeData.crime.crimeRate,
      environmental.temperature
    )
    
    // Compile enhanced statistical data
    const statistical = {
      deathRate: realTimeData.deathRate.overallDeathRate,
      ageAdjustedDeathRate: realTimeData.deathRate.ageAdjustedRate,
      crimeRate: realTimeData.crime.crimeRate,
      violentCrimeRate: realTimeData.crime.violentCrimeRate,
      safetyIndex: realTimeData.crime.safetyIndex,
      occupationHazardLevel: occupationHazard.hazardLevel,
      occupationDeathRate: realTimeData.occupationDeathRate.deathRate,
      cityHealthIndex
    }
    
    console.log(`[DataCollector] Data collection complete. Quality: ${realTimeData.dataQuality.overall}`)
    
    return {
      environmental,
      statistical,
      occupationHazard,
      cityStats,
      realTimeData,
      healthAlerts: realTimeData.healthAlerts,
      dataQuality: realTimeData.dataQuality
    }
  } catch (error) {
    console.error("[DataCollector] Error collecting data:", error)
    
    // Fallback to basic data collection
    console.log("[DataCollector] Falling back to basic data collection")
    return await collectBasicData(city, occupation, age)
  }
}

/**
 * Fallback basic data collection (original implementation)
 */
async function collectBasicData(
  city: string,
  occupation: string,
  age: number
): Promise<CollectedData> {
  try {
    // Fetch environmental data
    const environmental = await fetchEnvironmentalData(city)
    
    // Get city statistics
    const cityStats = getCityStatistics(city)
    
    // Get occupation hazard data
    const occupationHazard = getOccupationHazard(occupation)
    
    // Fetch death rate
    const deathRate = await fetchDeathRateData(city, age)
    
    // Calculate city health index
    const cityHealthIndex = calculateCityHealthIndex(
      environmental.aqi,
      cityStats.crimeRate,
      environmental.temperature
    )
    
    // Compile statistical data
    const statistical = {
      deathRate,
      crimeRate: cityStats.crimeRate,
      occupationHazardLevel: occupationHazard.hazardLevel,
      occupationDeathRate: occupationHazard.deathRate,
      cityHealthIndex
    }
    
    return {
      environmental,
      statistical,
      occupationHazard,
      cityStats
    }
  } catch (error) {
    console.error("[DataCollector] Error in basic data collection:", error)
    throw error
  }
}

/**
 * Fetch real-time news/alerts for health risks (optional enhancement)
 */
export async function fetchHealthAlerts(city: string): Promise<string[]> {
  // This could be enhanced to fetch real-time health alerts
  // For now, return static alerts based on conditions
  const alerts: string[] = []
  
  try {
    const envData = await fetchEnvironmentalData(city)
    
    if (envData.aqi > 200) {
      alerts.push("⚠️ Air quality is very poor. Avoid outdoor activities.")
    } else if (envData.aqi > 150) {
      alerts.push("⚠️ Air quality is unhealthy. Limit outdoor exposure.")
    }
    
    if (envData.temperature > 40) {
      alerts.push("🌡️ Extreme heat warning. Stay hydrated and avoid sun exposure.")
    }
    
    return alerts
  } catch (error) {
    return []
  }
}
