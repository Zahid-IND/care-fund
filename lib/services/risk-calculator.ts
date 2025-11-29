import { RiskFactor } from "@/types/agents"
import { calculateCrimeStressImpact } from "@/lib/data/crime-statistics"

export interface RiskCalculationInput {
  userProfile: any
  environmentalData: any
  statisticalData: any
  occupationHazard: any
  cityStats: any
}

/**
 * Calculate overall risk score (0-100) with enhanced real-time data
 */
export function calculateRiskScore(input: RiskCalculationInput): number {
  let score = 0
  
  // 1. Base risk (10 points)
  score += 10
  
  // 2. Age factor (0-20 points) - Enhanced with age-adjusted death rate
  const age = input.userProfile.age
  if (age > 60) score += 20
  else if (age > 50) score += 15
  else if (age > 40) score += 10
  else if (age > 30) score += 5
  
  // Additional age-adjusted death rate impact (if available)
  if (input.statisticalData.ageAdjustedDeathRate) {
    const ageDeathRateImpact = Math.min((input.statisticalData.ageAdjustedDeathRate / 20) * 5, 5)
    score += ageDeathRateImpact
  }
  
  // 3. Environmental factors (0-25 points) - Enhanced with seasonal risks
  const aqi = input.environmentalData.aqi
  if (aqi > 200) score += 25
  else if (aqi > 150) score += 20
  else if (aqi > 100) score += 15
  else if (aqi > 50) score += 10
  else score += 5
  
  // Additional seasonal risk impact
  if (input.environmentalData.seasonalRisks && input.environmentalData.seasonalRisks.length > 0) {
    score += Math.min(input.environmentalData.seasonalRisks.length * 2, 5)
  }
  
  // 4. Occupation hazard (0-20 points)
  const occupationRisk = input.occupationHazard.riskScore
  score += Math.round(occupationRisk * 0.2) // Scale to 0-20
  
  // 5. Health condition (0-15 points)
  if (input.userProfile.healthCondition !== "None" && input.userProfile.healthCondition !== "") {
    score += 15
  }
  
  // 6. Addictions (0-10 points)
  if (input.userProfile.addictions !== "None" && input.userProfile.addictions !== "") {
    score += 10
  }
  
  // 7. Past surgery (0-5 points)
  if (input.userProfile.pastSurgery !== "None" && input.userProfile.pastSurgery !== "") {
    score += 5
  }
  
  // 8. Work shift impact (0-5 points)
  if (input.userProfile.workShift === "Night Shift") {
    score += 5
  } else if (input.userProfile.workShift === "Rotating Shift") {
    score += 3
  }
  
  // 9. Crime-related stress (0-10 points) - Enhanced with violent crime rate
  const crimeStressImpact = calculateCrimeStressImpact(input.cityStats.crimeRate)
  score += Math.min(crimeStressImpact, 10)
  
  // Additional violent crime impact
  if (input.statisticalData.violentCrimeRate && input.statisticalData.violentCrimeRate > 30) {
    score += Math.min((input.statisticalData.violentCrimeRate / 10), 5)
  }
  
  // 10. Safety index impact (0-5 points)
  if (input.statisticalData.safetyIndex && input.statisticalData.safetyIndex < 60) {
    score += 5
  } else if (input.statisticalData.safetyIndex && input.statisticalData.safetyIndex < 70) {
    score += 3
  }
  
  // Cap at 100
  return Math.min(Math.round(score), 100)
}

/**
 * Determine risk level from score
 */
export function getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 80) return "critical"
  if (score >= 60) return "high"
  if (score >= 40) return "medium"
  return "low"
}

/**
 * Generate detailed risk factors with enhanced real-time data
 */
export function generateRiskFactors(input: RiskCalculationInput): RiskFactor[] {
  const factors: RiskFactor[] = []
  
  // Environmental risk - Enhanced with weather condition
  const aqi = input.environmentalData.aqi
  const weatherCondition = input.environmentalData.weatherCondition || ''
  
  if (aqi > 150) {
    factors.push({
      category: "Air Quality",
      level: aqi > 200 ? "critical" : "high",
      description: `AQI of ${aqi} poses significant respiratory health risks${weatherCondition ? ` (Current: ${weatherCondition})` : ''}`,
      impact: aqi > 200 ? 25 : 20
    })
  } else if (aqi > 100) {
    factors.push({
      category: "Air Quality",
      level: "medium",
      description: `AQI of ${aqi} may affect sensitive individuals${weatherCondition ? ` (Current: ${weatherCondition})` : ''}`,
      impact: 15
    })
  }
  
  // Seasonal risks
  if (input.environmentalData.seasonalRisks && input.environmentalData.seasonalRisks.length > 0) {
    const seasonalRiskLevel = input.environmentalData.seasonalRisks.length > 2 ? "high" : "medium"
    factors.push({
      category: "Seasonal Health Risks",
      level: seasonalRiskLevel,
      description: input.environmentalData.seasonalRisks.join('; '),
      impact: input.environmentalData.seasonalRisks.length * 2
    })
  }
  
  // Occupation risk
  const occupationHazard = input.occupationHazard
  if (occupationHazard.hazardLevel === "critical" || occupationHazard.hazardLevel === "high") {
    factors.push({
      category: "Occupational Hazard",
      level: occupationHazard.hazardLevel,
      description: `${input.userProfile.occupation} has ${occupationHazard.hazardLevel} risk level with death rate of ${occupationHazard.deathRate} per 100,000 workers`,
      impact: occupationHazard.riskScore * 0.2
    })
  }
  
  // Age risk
  const age = input.userProfile.age
  if (age > 50) {
    factors.push({
      category: "Age Factor",
      level: age > 60 ? "high" : "medium",
      description: `Age ${age} increases susceptibility to health conditions`,
      impact: age > 60 ? 20 : 15
    })
  }
  
  // Health condition
  if (input.userProfile.healthCondition !== "None" && input.userProfile.healthCondition !== "") {
    factors.push({
      category: "Pre-existing Condition",
      level: "high",
      description: `Existing health condition: ${input.userProfile.healthCondition}`,
      impact: 15
    })
  }
  
  // Lifestyle factors
  if (input.userProfile.addictions !== "None" && input.userProfile.addictions !== "") {
    factors.push({
      category: "Lifestyle Risk",
      level: "medium",
      description: `Addiction to ${input.userProfile.addictions} increases health risks`,
      impact: 10
    })
  }
  
  // Work shift
  if (input.userProfile.workShift === "Night Shift") {
    factors.push({
      category: "Work Schedule",
      level: "medium",
      description: "Night shift work disrupts circadian rhythm and increases health risks",
      impact: 5
    })
  }
  
  // Crime-related stress - Enhanced with violent crime data
  if (input.cityStats.crimeRate > 500) {
    const violentCrimeInfo = input.statisticalData.violentCrimeRate 
      ? ` including ${input.statisticalData.violentCrimeRate.toFixed(1)} violent crimes per 100k`
      : ''
    
    factors.push({
      category: "Environmental Stress",
      level: input.cityStats.crimeRate > 1000 ? "high" : "medium",
      description: `High crime rate (${input.cityStats.crimeRate} per 100k${violentCrimeInfo}) contributes to chronic stress`,
      impact: calculateCrimeStressImpact(input.cityStats.crimeRate)
    })
  }
  
  // Safety index
  if (input.statisticalData.safetyIndex && input.statisticalData.safetyIndex < 60) {
    factors.push({
      category: "City Safety",
      level: input.statisticalData.safetyIndex < 50 ? "high" : "medium",
      description: `Low safety index (${input.statisticalData.safetyIndex}/100) indicates higher security concerns`,
      impact: 5
    })
  }
  
  // City health index
  if (input.statisticalData.cityHealthIndex < 60) {
    factors.push({
      category: "City Health Infrastructure",
      level: input.statisticalData.cityHealthIndex < 40 ? "high" : "medium",
      description: `City health index of ${input.statisticalData.cityHealthIndex}/100 indicates limited healthcare access`,
      impact: 10
    })
  }
  
  // Sort by impact (highest first)
  return factors.sort((a, b) => b.impact - a.impact)
}

/**
 * Get risk level display information
 */
export function getRiskLevelInfo(score: number) {
  const level = getRiskLevel(score)
  
  const info = {
    low: {
      label: "Low Risk",
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Your health risk profile is favorable. Continue maintaining healthy habits."
    },
    medium: {
      label: "Medium Risk",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      description: "Some risk factors identified. Follow prevention steps to reduce risks."
    },
    high: {
      label: "High Risk",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Multiple risk factors present. Immediate preventive action recommended."
    },
    critical: {
      label: "Critical Risk",
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Significant health risks identified. Urgent medical consultation advised."
    }
  }
  
  return info[level]
}
