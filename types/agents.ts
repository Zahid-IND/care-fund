// Type definitions for AI Agents

export interface UserProfile {
  userId: string
  occupation: string
  city: string
  area: string
  workShift: string
  healthCondition: string
  addictions: string
  pastSurgery: string
  age: number
  profileCompleted: boolean
}

export interface EnvironmentalData {
  city: string
  aqi: number
  temperature: number
  humidity: number
  climateRisk: string
  weatherCondition?: string
  seasonalRisks?: string[]
  timestamp: string
}

export interface StatisticalData {
  deathRate: number
  crimeRate: number
  occupationHazardLevel: string
  occupationDeathRate: number
  cityHealthIndex: number
  ageAdjustedDeathRate?: number
  violentCrimeRate?: number
  safetyIndex?: number
}

export interface RiskFactor {
  category: string
  level: "low" | "medium" | "high" | "critical"
  description: string
  impact: number
}

export interface PreventionStep {
  priority: "high" | "medium" | "low"
  action: string
  description: string
  frequency: string
}

export interface Agent1Results {
  riskScore: number
  riskLevel: "low" | "medium" | "high" | "critical"
  environmentalData: EnvironmentalData
  statisticalData: StatisticalData
  riskFactors: RiskFactor[]
  preventionSteps: PreventionStep[]
  geminiAnalysis: string
  timestamp: string
  // Enhanced fields
  healthAlerts?: Array<{
    title: string
    description: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    category: string
    location: string
    date: string
    source: string
    url?: string
  }>
  dataQuality?: {
    overall: 'excellent' | 'good' | 'fair' | 'poor'
    sources: number
    realTimeDataPercentage: number
  }
  realTimeDataSources?: {
    climate: {
      weather: string
      aqi: string
    }
    deathRate: string
    crime: string
    occupationDeathRate: string
  }
}

export interface InsurancePlan {
  name: string
  type: string
  coverage: number
  premium: number
  features: string[]
  advantages: string[]
  disadvantages: string[]
  recommended: boolean
  affordability?: {
    isAffordable: boolean
    affordabilityScore: number
    monthlyIncomePercentage: number
    recommendation: string
    financialStrain: "low" | "moderate" | "high" | "critical"
  }
}

export interface FinancialRecommendation {
  category: string
  suggestion: string
  amount?: number
  priority: "high" | "medium" | "low"
}

export interface Agent2Results {
  insurancePlan: InsurancePlan
  alternativePlans: InsurancePlan[]
  monthlySavings: number
  emergencyFund: number
  yearlyHealthBudget: number
  financialRecommendations: FinancialRecommendation[]
  geminiAnalysis: string
  autoPaySetup: {
    available: boolean
    message: string
  }
  timestamp: string
}

export interface AnalysisResults {
  _id?: string
  userId: string
  profileData: UserProfile
  agent1Results: Agent1Results
  agent2Results: Agent2Results
  createdAt: Date
  updatedAt: Date
}

export interface AgentStep {
  id: string
  name: string
  status: "pending" | "processing" | "complete" | "error"
  icon: any
  description: string
  details?: string[]
  error?: string
}
