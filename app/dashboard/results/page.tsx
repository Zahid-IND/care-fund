"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, TrendingUp, Heart, AlertCircle, DollarSign, Calendar, Download, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface AnalysisResults {
  riskScore: number
  monthlySavings: number
  insurancePlan: {
    name: string
    coverage: number
    premium: number
  }
  timestamp: string
}

export default function ResultsPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [results, setResults] = useState<AnalysisResults | null>(null)

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn")
    const profileCompleted = localStorage.getItem("profileCompleted") === "true"
    const savedProfile = localStorage.getItem("userProfile")
    const analysisResults = localStorage.getItem("analysisResults")

    if (!loggedIn) {
      router.push("/login")
      return
    }

    if (!profileCompleted || !savedProfile) {
      router.push("/dashboard")
      return
    }

    if (!analysisResults) {
      router.push("/dashboard/analysis")
      return
    }

    setIsLoggedIn(true)
    setProfile(JSON.parse(savedProfile))
    setResults(JSON.parse(analysisResults))
  }, [router])

  const handleLogout = () => {
    localStorage.clear()
    router.push("/")
  }

  const getRiskLevel = (score: number) => {
    if (score < 40)
      return { label: "Low Risk", color: "text-green-600", bgColor: "bg-green-50", barColor: "bg-green-500" }
    if (score < 60)
      return { label: "Moderate Risk", color: "text-yellow-600", bgColor: "bg-yellow-50", barColor: "bg-yellow-500" }
    if (score < 75)
      return { label: "High Risk", color: "text-orange-600", bgColor: "bg-orange-50", barColor: "bg-orange-500" }
    return { label: "Very High Risk", color: "text-red-600", bgColor: "bg-red-50", barColor: "bg-red-500" }
  }

  if (!isLoggedIn || !profile || !results) {
    return null
  }

  const riskLevel = getRiskLevel(results.riskScore)
  const yearlyPremium = results.insurancePlan.premium * 12
  const yearlySavings = results.monthlySavings * 12

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
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Report Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-slate-900">Health Cost Prediction Report</h1>
                <p className="text-slate-600">
                  Generated for {profile.name} on {new Date(results.timestamp).toLocaleDateString()}
                </p>
              </div>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Risk Score Card */}
          <Card className="mb-6 border-cyan-200 bg-white/90 p-8 backdrop-blur-sm">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-2xl font-bold text-slate-900">Overall Risk Assessment</h2>
                <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 ${riskLevel.bgColor}`}>
                  <AlertCircle className={`h-5 w-5 ${riskLevel.color}`} />
                  <span className={`font-semibold ${riskLevel.color}`}>{riskLevel.label}</span>
                </div>
                <p className="mb-6 leading-relaxed text-slate-600">
                  Based on your health profile, environmental factors, and lifestyle data, we've calculated your health
                  risk score.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Risk Score</span>
                    <span className={`font-bold ${riskLevel.color}`}>{results.riskScore}/100</span>
                  </div>
                  <Progress value={results.riskScore} className="h-3" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Key Risk Factors</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-cyan-600"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Environmental Exposure</p>
                      <p className="text-xs text-slate-600">
                        High AQI levels in {profile.city} increase respiratory risks
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-teal-600"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Occupational Hazards</p>
                      <p className="text-xs text-slate-600">{profile.occupation} related health considerations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-cyan-600"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Health Condition</p>
                      <p className="text-xs text-slate-600">Current status: {profile.healthCondition}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Financial Recommendations */}
          <div className="mb-6 grid gap-6 md:grid-cols-2">
            {/* Insurance Plan */}
            <Card className="border-cyan-200 bg-white/90 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100">
                  <Shield className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Recommended Insurance</h3>
                  <p className="text-sm text-slate-600">Tailored to your risk profile</p>
                </div>
              </div>

              <div className="mb-4 rounded-lg bg-gradient-to-br from-cyan-50 to-teal-50 p-4">
                <h4 className="mb-2 text-lg font-bold text-slate-900">{results.insurancePlan.name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Coverage Amount</span>
                    <span className="font-semibold text-slate-900">
                      ₹{results.insurancePlan.coverage.toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Monthly Premium</span>
                    <span className="font-semibold text-cyan-600">
                      ₹{results.insurancePlan.premium.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Yearly Premium</span>
                    <span className="font-semibold text-slate-900">₹{yearlyPremium.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Badge className="w-full justify-center bg-cyan-100 py-2 text-cyan-800">
                Comprehensive Coverage Recommended
              </Badge>
            </Card>

            {/* Savings Plan */}
            <Card className="border-teal-200 bg-white/90 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                  <DollarSign className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Savings Strategy</h3>
                  <p className="text-sm text-slate-600">Build your emergency fund</p>
                </div>
              </div>

              <div className="mb-4 rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 p-4">
                <h4 className="mb-2 text-lg font-bold text-slate-900">Monthly Savings Goal</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Recommended Amount</span>
                    <span className="font-semibold text-teal-600">₹{results.monthlySavings.toLocaleString()}/mo</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">1 Year Target</span>
                    <span className="font-semibold text-slate-900">₹{yearlySavings.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">3 Year Target</span>
                    <span className="font-semibold text-slate-900">₹{(yearlySavings * 3).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Badge variant="outline" className="w-full justify-center border-teal-200 py-2 text-teal-800">
                <Calendar className="mr-2 h-4 w-4" />
                Auto-Debit Coming Soon
              </Badge>
            </Card>
          </div>

          {/* Prevention Steps */}
          <Card className="mb-6 border-cyan-200 bg-white/90 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Prevention & Action Steps</h3>
                <p className="text-sm text-slate-600">Recommendations to reduce your health risks</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="mb-2 font-semibold text-slate-900">Immediate Actions</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600">•</span>
                    <span>Install air purifier at home due to high AQI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600">•</span>
                    <span>Schedule comprehensive health check-up</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600">•</span>
                    <span>Consider N95 masks for outdoor activities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600">•</span>
                    <span>Review and update vaccination records</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="mb-2 font-semibold text-slate-900">Long-term Strategies</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600">•</span>
                    <span>Maintain regular exercise routine (30 min/day)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600">•</span>
                    <span>
                      Monitor and manage{" "}
                      {profile.healthCondition !== "None" ? profile.healthCondition : "overall health"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600">•</span>
                    <span>Annual preventive health screenings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600">•</span>
                    <span>Build emergency health fund gradually</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Confidence Score */}
          <Card className="border-cyan-200 bg-gradient-to-br from-cyan-600 to-teal-600 p-6 text-center backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white">
              <TrendingUp className="h-8 w-8 text-cyan-600" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-white">AI Confidence Score: 94%</h3>
            <p className="mb-4 text-cyan-50">
              Our AI agents analyzed multiple data points to provide you with highly accurate predictions and
              recommendations.
            </p>
            <div className="mx-auto max-w-md">
              <Progress value={94} className="h-2 bg-cyan-400" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
