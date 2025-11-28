"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Database, Brain, TrendingUp, CheckCircle2, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface AgentStep {
  id: string
  name: string
  status: "pending" | "processing" | "complete"
  icon: any
  description: string
  details?: string[]
}

export default function AnalysisPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([
    {
      id: "1",
      name: "Collector Agent",
      status: "pending",
      icon: Database,
      description: "Fetching pollution data for Mumbai...",
      details: [],
    },
    {
      id: "2",
      name: "Analyzer Agent",
      status: "pending",
      icon: Brain,
      description: "Analyzing health risks...",
      details: [],
    },
    {
      id: "3",
      name: "Planner Agent",
      status: "pending",
      icon: TrendingUp,
      description: "Generating financial recommendations...",
      details: [],
    },
  ])
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn")
    const profileCompleted = localStorage.getItem("profileCompleted") === "true"

    if (!loggedIn) {
      router.push("/login")
      return
    }

    if (!profileCompleted) {
      router.push("/dashboard")
      return
    }

    setIsLoggedIn(true)
  }, [router])

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    const profile = JSON.parse(localStorage.getItem("userProfile") || "{}")

    // Step 1: Collector Agent
    setAgentSteps((prev) => prev.map((step, idx) => (idx === 0 ? { ...step, status: "processing" } : step)))

    await new Promise((resolve) => setTimeout(resolve, 2000))

    setAgentSteps((prev) =>
      prev.map((step, idx) =>
        idx === 0
          ? {
              ...step,
              status: "complete",
              details: [
                `Location: ${profile.city}, ${profile.area}`,
                `AQI Level: 165 (Unhealthy for Sensitive Groups)`,
                `Temperature: 32°C, Humidity: 68%`,
                `Occupation Risk: ${profile.occupation}`,
                `Work Shift: ${profile.workShift}`,
                `Health Status: ${profile.healthCondition}`,
              ],
            }
          : step,
      ),
    )

    setCurrentStep(1)

    // Step 2: Analyzer Agent
    setAgentSteps((prev) => prev.map((step, idx) => (idx === 1 ? { ...step, status: "processing" } : step)))

    await new Promise((resolve) => setTimeout(resolve, 3000))

    const riskScore = calculateRiskScore(profile)

    setAgentSteps((prev) =>
      prev.map((step, idx) =>
        idx === 1
          ? {
              ...step,
              status: "complete",
              details: [
                `Overall Risk Score: ${riskScore}%`,
                `Environmental Impact: High AQI increases respiratory risk by 35%`,
                `Occupational Hazard: ${getOccupationRisk(profile.occupation)}`,
                `Health Condition Factor: ${profile.healthCondition !== "None" ? "Elevated risk" : "Low risk"}`,
                `Lifestyle Impact: ${profile.addictions !== "None" ? "Requires monitoring" : "Positive"}`,
                `Prevention Steps: Regular check-ups, air purifier recommended`,
              ],
            }
          : step,
      ),
    )

    setCurrentStep(2)

    // Step 3: Planner Agent
    setAgentSteps((prev) => prev.map((step, idx) => (idx === 2 ? { ...step, status: "processing" } : step)))

    await new Promise((resolve) => setTimeout(resolve, 2500))

    const monthlySavings = calculateMonthlySavings(profile, riskScore)
    const insurancePlan = getInsurancePlan(riskScore)

    setAgentSteps((prev) =>
      prev.map((step, idx) =>
        idx === 2
          ? {
              ...step,
              status: "complete",
              details: [
                `Recommended Insurance: ${insurancePlan.name}`,
                `Coverage Amount: ₹${insurancePlan.coverage.toLocaleString()}`,
                `Monthly Premium: ₹${insurancePlan.premium.toLocaleString()}`,
                `Suggested Monthly Savings: ₹${monthlySavings.toLocaleString()}`,
                `Emergency Fund Target: ₹${(monthlySavings * 12).toLocaleString()}`,
                `Future Feature: Auto-debit from bank account (Coming Soon)`,
              ],
            }
          : step,
      ),
    )

    // Store analysis results
    localStorage.setItem(
      "analysisResults",
      JSON.stringify({
        riskScore,
        monthlySavings,
        insurancePlan,
        timestamp: new Date().toISOString(),
      }),
    )

    setCurrentStep(3)
    setIsAnalyzing(false)
    setAnalysisComplete(true)
  }

  const calculateRiskScore = (profile: any): number => {
    let score = 30 // Base risk

    // AQI impact
    score += 15

    // Age factor
    const age = Number.parseInt(profile.age)
    if (age > 50) score += 15
    else if (age > 35) score += 10

    // Health condition
    if (profile.healthCondition !== "None") score += 20

    // Occupation
    if (["Factory Worker", "Healthcare Worker"].includes(profile.occupation)) score += 10

    // Addictions
    if (profile.addictions !== "None" && profile.addictions !== "") score += 15

    return Math.min(score, 85)
  }

  const getOccupationRisk = (occupation: string): string => {
    const risks: Record<string, string> = {
      "IT Professional": "Low physical risk, sedentary lifestyle concerns",
      "Healthcare Worker": "High exposure risk, stress factors",
      "Factory Worker": "High physical risk, industrial hazards",
      Driver: "Moderate risk, pollution exposure",
      Teacher: "Low-moderate risk, stress management needed",
      Engineer: "Low-moderate risk depending on field",
      "Business Owner": "Stress-related concerns, irregular schedule",
      Student: "Low risk, monitor lifestyle habits",
    }
    return risks[occupation] || "Moderate general risk"
  }

  const calculateMonthlySavings = (profile: any, riskScore: number): number => {
    const baseAmount = 2000
    const riskMultiplier = riskScore / 50
    return Math.round(baseAmount * riskMultiplier)
  }

  const getInsurancePlan = (riskScore: number) => {
    if (riskScore > 70) {
      return {
        name: "Premium Health Shield",
        coverage: 1000000,
        premium: 8500,
      }
    } else if (riskScore > 50) {
      return {
        name: "Comprehensive Care Plus",
        coverage: 500000,
        premium: 5500,
      }
    } else {
      return {
        name: "Essential Health Cover",
        coverage: 300000,
        premium: 3500,
      }
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/")
  }

  if (!isLoggedIn) {
    return null
  }

  const progress = (currentStep / 3) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <header className="border-b border-white/50 bg-white/70 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-cyan-600" />
            <span className="text-2xl font-bold text-slate-900">CareFund</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/report")}>
              Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-slate-900">AI Agent Analysis</h1>
            <p className="text-slate-600">Watch our AI agents work together to analyze your health data</p>
          </div>

          {!isAnalyzing && !analysisComplete && (
            <Card className="mb-8 border-cyan-200 bg-white/90 p-8 text-center backdrop-blur-sm">
              <Brain className="mx-auto mb-4 h-16 w-16 text-cyan-600" />
              <h2 className="mb-2 text-2xl font-bold text-slate-900">Ready to Analyze</h2>
              <p className="mb-6 text-slate-600">
                Our AI agents will analyze your profile, environmental data, and health factors to provide personalized
                recommendations.
              </p>
              <Button
                size="lg"
                onClick={runAnalysis}
                className="rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 px-8 hover:from-cyan-700 hover:to-teal-700"
              >
                Start AI Analysis
              </Button>
            </Card>
          )}

          {(isAnalyzing || analysisComplete) && (
            <>
              {/* Progress Bar */}
              <Card className="mb-6 border-cyan-200 bg-white/90 p-6 backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Analysis Progress</span>
                  <span className="text-sm font-semibold text-cyan-600">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </Card>

              {/* Agent Steps */}
              <div className="space-y-4">
                {agentSteps.map((step, index) => (
                  <Card
                    key={step.id}
                    className={`border-cyan-200 bg-white/90 p-6 backdrop-blur-sm transition-all ${
                      step.status === "processing" ? "ring-2 ring-cyan-400" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                          step.status === "complete"
                            ? "bg-green-100"
                            : step.status === "processing"
                              ? "bg-cyan-100"
                              : "bg-slate-100"
                        }`}
                      >
                        {step.status === "complete" ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : step.status === "processing" ? (
                          <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
                        ) : (
                          <step.icon className="h-6 w-6 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{step.name}</h3>
                          {step.status === "processing" && (
                            <Badge variant="outline" className="border-cyan-200 text-cyan-700">
                              Processing...
                            </Badge>
                          )}
                          {step.status === "complete" && (
                            <Badge className="bg-green-100 text-green-800">Complete</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{step.description}</p>

                        {step.details && step.details.length > 0 && (
                          <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4">
                            {step.details.map((detail, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-600" />
                                <span className="text-slate-700">{detail}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {analysisComplete && (
                <Card className="mt-6 border-cyan-200 bg-gradient-to-br from-cyan-600 to-teal-600 p-8 text-center backdrop-blur-sm">
                  <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-white" />
                  <h2 className="mb-2 text-2xl font-bold text-white">Analysis Complete!</h2>
                  <p className="mb-6 text-cyan-50">
                    Your personalized health cost prediction and financial recommendations are ready.
                  </p>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="rounded-full px-8"
                    onClick={() => router.push("/dashboard/results")}
                  >
                    View Full Report
                  </Button>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
