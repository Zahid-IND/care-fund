import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { collectAllData } from "@/lib/services/data-collector"
import { calculateRiskScore, getRiskLevel, generateRiskFactors } from "@/lib/services/risk-calculator"
import { analyzeHealthRisks, generatePreventionSteps, isGeminiConfigured } from "@/lib/services/gemini-service"
import { Agent1Results } from "@/types/agents"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userProfile } = body

    if (!userProfile) {
      return NextResponse.json({ error: "User profile is required" }, { status: 400 })
    }

    console.log("[Agent 1] Starting enhanced data collection and analysis...")
    console.log(`[Agent 1] User: ${userProfile.occupation}, ${userProfile.city}, Age: ${userProfile.age}`)

    // Step 1: Collect all data from various sources (now with real-time data)
    const collectedData = await collectAllData(
      userProfile.city,
      userProfile.occupation,
      userProfile.age
    )

    console.log("[Agent 1] Data collection complete")
    if (collectedData.dataQuality) {
      console.log(`[Agent 1] Data Quality: ${collectedData.dataQuality.overall} (${collectedData.dataQuality.realTimeDataPercentage}% real-time)`)
    }

    // Step 2: Calculate risk score
    const riskCalculationInput = {
      userProfile,
      environmentalData: collectedData.environmental,
      statisticalData: collectedData.statistical,
      occupationHazard: collectedData.occupationHazard,
      cityStats: collectedData.cityStats
    }

    const riskScore = calculateRiskScore(riskCalculationInput)
    const riskLevel = getRiskLevel(riskScore)
    const riskFactors = generateRiskFactors(riskCalculationInput)

    console.log("[Agent 1] Risk calculation complete. Score:", riskScore)

    // Step 3: Generate AI analysis using Gemini (if configured)
    let geminiAnalysis = "Risk analysis based on statistical data and expert guidelines."
    
    if (isGeminiConfigured()) {
      try {
        console.log("[Agent 1] Requesting Gemini AI analysis...")
        geminiAnalysis = await analyzeHealthRisks({
          userProfile,
          environmentalData: collectedData.environmental,
          statisticalData: collectedData.statistical,
          occupationHazard: collectedData.occupationHazard,
          cityStats: collectedData.cityStats
        })
        console.log("[Agent 1] Gemini analysis complete")
      } catch (error) {
        console.error("[Agent 1] Gemini analysis failed:", error)
      }
    } else {
      console.log("[Agent 1] Gemini API not configured, using fallback analysis")
    }

    // Step 4: Generate prevention steps
    let preventionSteps: any[] = []
    
    if (isGeminiConfigured()) {
      try {
        const steps = await generatePreventionSteps(
          riskFactors,
          userProfile,
          collectedData.occupationHazard
        )
        preventionSteps = steps.map((step, index) => ({
          priority: index < 2 ? "high" : index < 4 ? "medium" : "low",
          action: step,
          description: step,
          frequency: "Daily"
        }))
      } catch (error) {
        console.error("[Agent 1] Prevention steps generation failed:", error)
      }
    }

    // Fallback prevention steps
    if (preventionSteps.length === 0) {
      preventionSteps = [
        {
          priority: "high",
          action: "Schedule regular health check-ups",
          description: "Get comprehensive health screening every 6 months",
          frequency: "Bi-annually"
        },
        {
          priority: "high",
          action: "Monitor air quality daily",
          description: `Use air purifier when AQI exceeds 100 (current: ${collectedData.environmental.aqi})`,
          frequency: "Daily"
        },
        {
          priority: "medium",
          action: "Follow occupation safety guidelines",
          description: collectedData.occupationHazard.preventiveMeasures[0] || "Follow workplace safety protocols",
          frequency: "Daily"
        },
        {
          priority: "medium",
          action: "Maintain healthy lifestyle",
          description: "Exercise 30 minutes daily, eat balanced diet, get 7-8 hours sleep",
          frequency: "Daily"
        },
        {
          priority: "low",
          action: "Stress management",
          description: "Practice meditation or yoga to manage work and environmental stress",
          frequency: "Daily"
        }
      ]
    }

    // Compile Agent 1 results with enhanced data
    const agent1Results: Agent1Results = {
      riskScore,
      riskLevel,
      environmentalData: collectedData.environmental,
      statisticalData: collectedData.statistical,
      riskFactors,
      preventionSteps,
      geminiAnalysis,
      timestamp: new Date().toISOString(),
      // Add enhanced data fields
      ...(collectedData.healthAlerts && { healthAlerts: collectedData.healthAlerts }),
      ...(collectedData.dataQuality && { dataQuality: collectedData.dataQuality }),
      ...(collectedData.realTimeData && { 
        realTimeDataSources: {
          climate: collectedData.realTimeData.climate.sources,
          deathRate: collectedData.realTimeData.deathRate.source,
          crime: collectedData.realTimeData.crime.source,
          occupationDeathRate: collectedData.realTimeData.occupationDeathRate.source
        }
      })
    }

    console.log("[Agent 1] Analysis complete")
    console.log(`[Agent 1] Risk Score: ${riskScore}/100 (${riskLevel})`)
    console.log(`[Agent 1] Risk Factors: ${riskFactors.length}`)
    console.log(`[Agent 1] Prevention Steps: ${preventionSteps.length}`)

    return NextResponse.json({
      success: true,
      data: agent1Results,
      metadata: {
        dataQuality: collectedData.dataQuality,
        processingTime: Date.now() - Date.now(),
        version: '2.0-enhanced'
      }
    })

  } catch (error) {
    console.error("[Agent 1] Error:", error)
    return NextResponse.json(
      { 
        error: "Failed to complete risk analysis",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
