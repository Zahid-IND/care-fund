"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Shield, Database, Brain, TrendingUp, CheckCircle2, Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { AgentStep } from "@/types/agents"

export default function AnalysisPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([
    {
      id: "1",
      name: "Data Collector Agent",
      status: "pending",
      icon: Database,
      description: "Collecting real-time environmental and statistical data...",
      details: [],
    },
    {
      id: "2",
      name: "Risk Analyzer Agent",
      status: "pending",
      icon: Brain,
      description: "Analyzing health risks using AI...",
      details: [],
    },
    {
      id: "3",
      name: "Financial Planner Agent",
      status: "pending",
      icon: TrendingUp,
      description: "Generating personalized financial recommendations...",
      details: [],
    },
  ])
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [agent1Results, setAgent1Results] = useState<any>(null)
  const [agent2Results, setAgent2Results] = useState<any>(null)

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (session?.user) {
      fetchProfile()
    }
  }, [status, session, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      const data = await response.json()

      if (data.profileCompleted === false || !data.city) {
        router.push("/dashboard")
        return
      }

      setProfile(data)
      setIsLoadingProfile(false)
    } catch (error) {
      console.error("[Analysis] Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
      setIsLoadingProfile(false)
    }
  }

  const runAnalysis = async () => {
    if (!profile) return
    setIsAnalyzing(true)
    setCurrentStep(0)

    try {
      // Step 1: Run Agent 1 (Collector & Analyzer)
      setAgentSteps((prev) => 
        prev.map((step, idx) => 
          idx === 0 ? { ...step, status: "processing", description: "Fetching real-time data from multiple sources..." } : step
        )
      )

      const agent1Response = await fetch("/api/agents/collector-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile: profile }),
      })

      if (!agent1Response.ok) {
        throw new Error("Agent 1 failed")
      }

      const agent1Data = await agent1Response.json()
      setAgent1Results(agent1Data.data)

      // Update Agent 1 step with results
      const envData = agent1Data.data.environmentalData
      const statsData = agent1Data.data.statisticalData
      
      setAgentSteps((prev) =>
        prev.map((step, idx) =>
          idx === 0
            ? {
                ...step,
                status: "complete",
                description: "Data collection complete",
                details: [
                  `📍 Location: ${envData.city}, ${profile.area}`,
                  `🌫️ Air Quality Index: ${envData.aqi} (${envData.climateRisk} Risk)`,
                  `🌡️ Temperature: ${envData.temperature}°C, Humidity: ${envData.humidity}%`,
                  `💼 Occupation: ${profile.occupation} (${statsData.occupationHazardLevel} hazard level)`,
                  `📊 City Health Index: ${statsData.cityHealthIndex}/100`,
                  `🚨 Crime Rate: ${statsData.crimeRate} per 100,000 population`,
                ],
              }
            : step,
        ),
      )

      setCurrentStep(1)

      // Step 2: Display Agent 1 Analysis Results
      setAgentSteps((prev) =>
        prev.map((step, idx) =>
          idx === 1 ? { ...step, status: "processing", description: "AI analyzing health risks and generating insights..." } : step
        )
      )

      // Simulate AI processing time
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const riskFactors = agent1Data.data.riskFactors
      const riskScore = agent1Data.data.riskScore
      const riskLevel = agent1Data.data.riskLevel

      setAgentSteps((prev) =>
        prev.map((step, idx) =>
          idx === 1
            ? {
                ...step,
                status: "complete",
                description: "Risk analysis complete",
                details: [
                  `🎯 Overall Risk Score: ${riskScore}/100 (${riskLevel.toUpperCase()} Risk)`,
                  `⚠️ Top Risk Factors:`,
                  ...riskFactors.slice(0, 4).map((f: any) => `  • ${f.category}: ${f.description}`),
                  `💡 AI Analysis: ${agent1Data.data.geminiAnalysis.substring(0, 150)}...`,
                ],
              }
            : step,
        ),
      )

      setCurrentStep(2)

      // Step 3: Run Agent 2 (Financial Planner)
      setAgentSteps((prev) =>
        prev.map((step, idx) =>
          idx === 2 ? { ...step, status: "processing", description: "Calculating insurance plans and savings recommendations..." } : step
        )
      )

      const agent2Response = await fetch("/api/agents/planner-financial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          agent1Results: agent1Data.data,
          userProfile: profile 
        }),
      })

      if (!agent2Response.ok) {
        throw new Error("Agent 2 failed")
      }

      const agent2Data = await agent2Response.json()
      setAgent2Results(agent2Data.data)

      const insurancePlan = agent2Data.data.insurancePlan
      const monthlySavings = agent2Data.data.monthlySavings
      const emergencyFund = agent2Data.data.emergencyFund

      setAgentSteps((prev) =>
        prev.map((step, idx) =>
          idx === 2
            ? {
                ...step,
                status: "complete",
                description: "Financial planning complete",
                details: [
                  `🏥 Recommended Insurance: ${insurancePlan.name}`,
                  `💰 Coverage Amount: ₹${insurancePlan.coverage.toLocaleString()}`,
                  `📅 Monthly Premium: ₹${insurancePlan.premium.toLocaleString()}`,
                  `💵 Suggested Monthly Savings: ₹${monthlySavings.toLocaleString()}`,
                  `🎯 Emergency Fund Target: ₹${emergencyFund.toLocaleString()}`,
                  `🔮 ${agent2Data.data.autoPaySetup.message}`,
                ],
              }
            : step,
        ),
      )

      // Store complete results in session storage
      sessionStorage.setItem(
        "analysisResults",
        JSON.stringify({
          riskScore: agent1Data.data.riskScore,
          riskLevel: agent1Data.data.riskLevel,
          monthlySavings: agent2Data.data.monthlySavings,
          insurancePlan: agent2Data.data.insurancePlan,
          agent1Results: agent1Data.data,
          agent2Results: agent2Data.data,
          timestamp: new Date().toISOString(),
        }),
      )

      setCurrentStep(3)
      setAnalysisComplete(true)
      setIsAnalyzing(false)

      toast({
        title: "Analysis Complete!",
        description: "Your personalized health and financial report is ready.",
      })

    } catch (error) {
      console.error("[Analysis] Error during analysis:", error)
      
      // Mark current step as error
      setAgentSteps((prev) =>
        prev.map((step, idx) =>
          idx === currentStep
            ? {
                ...step,
                status: "error",
                description: "An error occurred during analysis",
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : step,
        ),
      )

      toast({
        title: "Analysis Failed",
        description: "An error occurred during the analysis. Please try again.",
        variant: "destructive",
      })

      setIsAnalyzing(false)
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }

  if (status === "loading" || isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-cyan-600" />
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated" || !profile) {
    return null
  }

  const progress = analysisComplete ? 100 : (currentStep / 3) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <header className="border-b border-white/50 bg-white/70 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <img src={"/logo.jpg"} className="w-[50px]"/>
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
            <p className="text-slate-600">Watch our AI agents work together to analyze your health data in real-time</p>
          </div>

          {!isAnalyzing && !analysisComplete && (
            <Card className="mb-8 border-cyan-200 bg-white/90 p-8 text-center backdrop-blur-sm">
              <Brain className="mx-auto mb-4 h-16 w-16 text-cyan-600" />
              <h2 className="mb-2 text-2xl font-bold text-slate-900">Ready to Analyze</h2>
              <p className="mb-6 text-slate-600">
                Our AI agents will collect real-time data, analyze your health risks, and generate personalized
                financial recommendations.
              </p>
              <div className="mb-6 rounded-lg bg-cyan-50 p-4 text-left">
                <h3 className="mb-2 font-semibold text-slate-900">What we'll analyze:</h3>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>✓ Real-time air quality and climate data for {profile.city}</li>
                  <li>✓ Occupation-specific health hazards and risks</li>
                  <li>✓ City crime statistics and environmental stress factors</li>
                  <li>✓ Your personal health profile and lifestyle factors</li>
                  <li>✓ AI-powered risk assessment and prevention strategies</li>
                  <li>✓ Personalized insurance plans and savings recommendations</li>
                </ul>
              </div>
              <Button
                size="lg"
                onClick={runAnalysis}
                disabled={isAnalyzing}
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
                    } ${step.status === "error" ? "ring-2 ring-red-400" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                          step.status === "complete"
                            ? "bg-green-100"
                            : step.status === "processing"
                              ? "bg-cyan-100"
                              : step.status === "error"
                                ? "bg-red-100"
                                : "bg-slate-100"
                        }`}
                      >
                        {step.status === "complete" ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : step.status === "processing" ? (
                          <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
                        ) : step.status === "error" ? (
                          <AlertTriangle className="h-6 w-6 text-red-600" />
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
                          {step.status === "error" && (
                            <Badge className="bg-red-100 text-red-800">Error</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{step.description}</p>

                        {step.error && (
                          <div className="mt-4 rounded-lg bg-red-50 p-4">
                            <p className="text-sm text-red-800">{step.error}</p>
                          </div>
                        )}

                        {step.details && step.details.length > 0 && (
                          <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4">
                            {step.details.map((detail, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
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
                  <div className="flex justify-center gap-4">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="rounded-full px-8"
                      onClick={() => router.push("/dashboard/results")}
                    >
                      View Full Report
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full border-white bg-white/10 px-8 text-white hover:bg-white/20"
                      onClick={() => {
                        setIsAnalyzing(false)
                        setAnalysisComplete(false)
                        setCurrentStep(0)
                        setAgentSteps((prev) =>
                          prev.map((step) => ({ ...step, status: "pending" as const, details: [] }))
                        )
                      }}
                    >
                      Run Again
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
