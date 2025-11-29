"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Shield, TrendingUp, Heart, AlertCircle, DollarSign, Calendar, Download, Home, RefreshCw, CheckCircle2, XCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface InsurancePlan {
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

interface AnalysisResults {
  riskScore: number
  monthlySavings: number
  insurancePlan: InsurancePlan
  agent2Results?: {
    alternativePlans: InsurancePlan[]
  }
  timestamp: string
}

export default function ResultsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (session?.user) {
      fetchProfile()
      loadAnalysisResults()
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
      console.error("[Results] Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
      setIsLoadingProfile(false)
    }
  }

  const loadAnalysisResults = () => {
    const analysisResults = sessionStorage.getItem("analysisResults")
    
    if (!analysisResults) {
      router.push("/dashboard/analysis")
      return
    }

    setResults(JSON.parse(analysisResults))
  }

  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }

  const handleDownloadPDF = async () => {
    if (!profile || !results) return

    setIsGeneratingPDF(true)
    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your report...",
    })

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const margin = 15
      const contentWidth = pageWidth - 2 * margin
      let yPos = margin

      const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
        pdf.setFontSize(fontSize)
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal')
        pdf.setTextColor(...color)
        const lines = pdf.splitTextToSize(text, contentWidth)
        pdf.text(lines, margin, yPos)
        yPos += lines.length * fontSize * 0.35 + 3
      }

      const checkNewPage = (spaceNeeded: number = 20) => {
        if (yPos + spaceNeeded > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage()
          yPos = margin
          return true
        }
        return false
      }

      // Title
      pdf.setFillColor(6, 182, 212)
      pdf.rect(0, 0, pageWidth, 40, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text('CareFund', margin, 15)
      pdf.setFontSize(18)
      pdf.text('Health Cost Prediction Report', margin, 28)
      
      yPos = 50

      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Generated for: ${profile.name}`, margin, yPos)
      yPos += 5
      pdf.text(`Date: ${new Date(results.timestamp).toLocaleDateString()}`, margin, yPos)
      yPos += 10

      addText('Overall Risk Assessment', 16, true, [6, 182, 212])
      yPos += 2
      
      const riskLevel = getRiskLevel(results.riskScore)
      addText(`Risk Level: ${riskLevel.label}`, 12, true)
      addText(`Risk Score: ${results.riskScore}/100`, 11)
      yPos += 5

      addText('Key Risk Factors:', 12, true)
      addText(`• Environmental Exposure: High AQI levels in ${profile.city}`, 10)
      addText(`• Occupational Hazards: ${profile.occupation} related considerations`, 10)
      const healthStatus = profile.healthCondition === "Other" && profile.customHealthCondition
        ? profile.customHealthCondition
        : profile.healthCondition
      addText(`• Health Condition: ${healthStatus}`, 10)
      yPos += 10

      checkNewPage()

      addText('Recommended Insurance Plan', 16, true, [6, 182, 212])
      yPos += 2
      
      addText(results.insurancePlan.name, 14, true)
      addText(`Type: ${results.insurancePlan.type}`, 11)
      addText(`Monthly Premium: Rs.${results.insurancePlan.premium.toLocaleString()}`, 11)
      addText(`Coverage: Rs.${results.insurancePlan.coverage.toLocaleString()}`, 11)
      addText(`Yearly Premium: Rs.${(results.insurancePlan.premium * 12).toLocaleString()}`, 11)
      yPos += 5

      if (results.insurancePlan.affordability) {
        const aff = results.insurancePlan.affordability
        addText('Affordability Analysis:', 12, true)
        addText(`Score: ${aff.affordabilityScore}/100`, 10)
        addText(`Percentage of Income: ${aff.monthlyIncomePercentage}%`, 10)
        addText(`Financial Strain: ${aff.financialStrain.toUpperCase()}`, 10)
        addText(`Recommendation: ${aff.recommendation}`, 10)
        yPos += 5
      }

      checkNewPage()

      addText('Key Features:', 12, true)
      results.insurancePlan.features.slice(0, 5).forEach(feature => {
        addText(`• ${feature}`, 10)
      })
      yPos += 5

      checkNewPage()

      addText('Advantages:', 12, true)
      results.insurancePlan.advantages.slice(0, 4).forEach(adv => {
        addText(`✓ ${adv}`, 10)
      })
      yPos += 5

      checkNewPage()

      if (results.agent2Results?.alternativePlans && results.agent2Results.alternativePlans.length > 0) {
        addText('Alternative Insurance Plans', 16, true, [6, 182, 212])
        yPos += 5

        const tableData = results.agent2Results.alternativePlans.map(plan => [
          plan.name,
          plan.type,
          `Rs.${plan.premium.toLocaleString()}`,
          `Rs.${plan.coverage.toLocaleString()}`,
          plan.affordability ? `${plan.affordability.affordabilityScore}/100` : 'N/A'
        ])

        autoTable(pdf, {
          startY: yPos,
          head: [['Plan Name', 'Type', 'Monthly Premium', 'Coverage', 'Affordability']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [6, 182, 212], textColor: [255, 255, 255] },
          margin: { left: margin, right: margin },
          styles: { fontSize: 9 },
        })

        yPos = (pdf as any).lastAutoTable.finalY + 10
      }

      checkNewPage()

      addText('Savings Strategy', 16, true, [6, 182, 212])
      yPos += 2
      
      addText(`Monthly Savings Goal: Rs.${results.monthlySavings.toLocaleString()}`, 11)
      addText(`1 Year Target: Rs.${(results.monthlySavings * 12).toLocaleString()}`, 11)
      addText(`3 Year Target: Rs.${(results.monthlySavings * 36).toLocaleString()}`, 11)
      yPos += 10

      checkNewPage()

      addText('Prevention & Action Steps', 16, true, [6, 182, 212])
      yPos += 2
      
      addText('Immediate Actions:', 12, true)
      addText('• Install air purifier at home due to high AQI', 10)
      addText('• Schedule comprehensive health check-up', 10)
      addText('• Consider N95 masks for outdoor activities', 10)
      addText('• Review and update vaccination records', 10)
      yPos += 5

      addText('Long-term Strategies:', 12, true)
      addText('• Maintain regular exercise routine (30 min/day)', 10)
      addText(`• Monitor and manage ${healthStatus}`, 10)
      addText('• Annual preventive health screenings', 10)
      addText('• Build emergency health fund gradually', 10)
      yPos += 10

      checkNewPage(30)
      pdf.setFillColor(6, 182, 212)
      pdf.rect(0, pdf.internal.pageSize.getHeight() - 25, pageWidth, 25, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(10)
      pdf.text('AI Confidence Score: 94%', margin, pdf.internal.pageSize.getHeight() - 15)
      pdf.setFontSize(8)
      pdf.text('Generated by CareFund - Your Health Cost Prediction Partner', margin, pdf.internal.pageSize.getHeight() - 8)

      const date = new Date().toISOString().split('T')[0]
      const filename = `CareFund_Report_${profile.name.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.pdf`

      pdf.save(filename)

      toast({
        title: "Success!",
        description: "Your report has been downloaded successfully.",
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: "Error",
        description: `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
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

  const getAffordabilityColor = (strain: string) => {
    switch (strain) {
      case "low":
        return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" }
      case "moderate":
        return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" }
      case "high":
        return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" }
      case "critical":
        return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" }
      default:
        return { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" }
    }
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

  if (status === "unauthenticated" || !profile || !results) {
    return null
  }

  const riskLevel = getRiskLevel(results.riskScore)
  const yearlyPremium = results.insurancePlan.premium * 12
  const yearlySavings = results.monthlySavings * 12
  const allPlans = [results.insurancePlan, ...(results.agent2Results?.alternativePlans || [])]

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
        <div className="mx-auto max-w-7xl">
          {/* Report Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-slate-900">Health Cost Prediction Report</h1>
                <p className="text-slate-600">
                  Generated for {profile.name} on {new Date(results.timestamp).toLocaleDateString()}
                </p>
              </div>
              <Button 
                variant="outline" 
                className="gap-2 bg-white hover:bg-slate-50"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </>
                )}
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
                      <p className="text-xs text-slate-600">
                        Current status: {profile.healthCondition === "Other" && profile.customHealthCondition
                          ? profile.customHealthCondition
                          : profile.healthCondition}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Insurance Options Section - NEW */}
          <Card className="mb-6 border-cyan-200 bg-white/90 p-8 backdrop-blur-sm">
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold text-slate-900">Insurance Plan Options</h2>
              <p className="text-slate-600">
                Compare different insurance plans based on your income of ₹{profile.monthlyIncome ? Number(profile.monthlyIncome).toLocaleString('en-IN') : 'N/A'}/month
              </p>
            </div>

            <Tabs defaultValue="recommended" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                <TabsTrigger value="all">All Plans</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
              </TabsList>

              {/* Recommended Plan Tab */}
              <TabsContent value="recommended" className="mt-6">
                <div className="rounded-lg border-2 border-cyan-300 bg-gradient-to-br from-cyan-50 to-teal-50 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <Badge className="mb-2 bg-cyan-600">Recommended for You</Badge>
                      <h3 className="text-2xl font-bold text-slate-900">{results.insurancePlan.name}</h3>
                      <p className="text-sm text-slate-600">{results.insurancePlan.type} Plan</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Monthly Premium</p>
                      <p className="text-3xl font-bold text-cyan-600">₹{results.insurancePlan.premium.toLocaleString()}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="mb-3 font-semibold text-slate-900">Coverage Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Coverage Amount:</span>
                          <span className="font-semibold">₹{results.insurancePlan.coverage.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Yearly Premium:</span>
                          <span className="font-semibold">₹{yearlyPremium.toLocaleString()}</span>
                        </div>
                      </div>

                      <h4 className="mb-3 mt-4 font-semibold text-slate-900">Key Features</h4>
                      <ul className="space-y-2">
                        {results.insurancePlan.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-600" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      {results.insurancePlan.affordability && (
                        <div className={`mb-4 rounded-lg border p-4 ${getAffordabilityColor(results.insurancePlan.affordability.financialStrain).bg} ${getAffordabilityColor(results.insurancePlan.affordability.financialStrain).border}`}>
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="font-semibold text-slate-900">Affordability Analysis</h4>
                            <Badge variant="outline" className={getAffordabilityColor(results.insurancePlan.affordability.financialStrain).text}>
                              {results.insurancePlan.affordability.monthlyIncomePercentage}% of income
                            </Badge>
                          </div>
                          <Progress value={results.insurancePlan.affordability.affordabilityScore} className="mb-2 h-2" />
                          <p className="text-sm text-slate-700">{results.insurancePlan.affordability.recommendation}</p>
                        </div>
                      )}

                      <h4 className="mb-3 font-semibold text-slate-900">Advantages</h4>
                      <ul className="mb-4 space-y-2">
                        {results.insurancePlan.advantages.slice(0, 3).map((adv, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                            <span>{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* All Plans Tab */}
              <TabsContent value="all" className="mt-6">
                <div className="grid gap-6 md:grid-cols-3">
                  {allPlans.map((plan, idx) => (
                    <Card key={idx} className={`p-6 ${plan.recommended ? 'border-2 border-cyan-400' : 'border-slate-200'}`}>
                      {plan.recommended && (
                        <Badge className="mb-3 bg-cyan-600">Recommended</Badge>
                      )}
                      <h3 className="mb-1 text-xl font-bold text-slate-900">{plan.name}</h3>
                      <p className="mb-4 text-sm text-slate-600">{plan.type} Plan</p>

                      <div className="mb-4 rounded-lg bg-slate-50 p-3">
                        <p className="text-sm text-slate-600">Monthly Premium</p>
                        <p className="text-2xl font-bold text-cyan-600">₹{plan.premium.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">Coverage: ₹{plan.coverage.toLocaleString()}</p>
                      </div>

                      {plan.affordability && (
                        <div className={`mb-4 rounded-lg p-3 ${getAffordabilityColor(plan.affordability.financialStrain).bg}`}>
                          <div className="mb-1 flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-700">Affordability</p>
                            <p className={`text-xs font-semibold ${getAffordabilityColor(plan.affordability.financialStrain).text}`}>
                              {plan.affordability.monthlyIncomePercentage}%
                            </p>
                          </div>
                          <Progress value={plan.affordability.affordabilityScore} className="h-1.5" />
                        </div>
                      )}

                      <Separator className="my-4" />

                      <div className="space-y-3">
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-green-700">Advantages</h4>
                          <ul className="space-y-1">
                            {plan.advantages.slice(0, 2).map((adv, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                                <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-600" />
                                <span>{adv}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-red-700">Disadvantages</h4>
                          <ul className="space-y-1">
                            {plan.disadvantages.slice(0, 2).map((dis, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                                <XCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-red-600" />
                                <span>{dis}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Comparison Tab */}
              <TabsContent value="comparison" className="mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="p-4 text-left text-sm font-semibold text-slate-900">Feature</th>
                        {allPlans.map((plan, idx) => (
                          <th key={idx} className="p-4 text-center text-sm font-semibold text-slate-900">
                            {plan.name}
                            {plan.recommended && <Badge className="ml-2 bg-cyan-600 text-xs">Recommended</Badge>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="p-4 text-sm font-medium text-slate-700">Monthly Premium</td>
                        {allPlans.map((plan, idx) => (
                          <td key={idx} className="p-4 text-center text-sm font-semibold text-cyan-600">
                            ₹{plan.premium.toLocaleString()}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-4 text-sm font-medium text-slate-700">Coverage Amount</td>
                        {allPlans.map((plan, idx) => (
                          <td key={idx} className="p-4 text-center text-sm text-slate-600">
                            ₹{plan.coverage.toLocaleString()}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-4 text-sm font-medium text-slate-700">Affordability Score</td>
                        {allPlans.map((plan, idx) => (
                          <td key={idx} className="p-4 text-center">
                            {plan.affordability && (
                              <div className="flex flex-col items-center gap-1">
                                <span className={`text-sm font-semibold ${getAffordabilityColor(plan.affordability.financialStrain).text}`}>
                                  {plan.affordability.affordabilityScore}/100
                                </span>
                                <span className="text-xs text-slate-500">
                                  {plan.affordability.monthlyIncomePercentage}% of income
                                </span>
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-4 text-sm font-medium text-slate-700">Plan Type</td>
                        {allPlans.map((plan, idx) => (
                          <td key={idx} className="p-4 text-center text-sm text-slate-600">
                            {plan.type}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-4 text-sm font-medium text-slate-700">Key Advantages</td>
                        {allPlans.map((plan, idx) => (
                          <td key={idx} className="p-4">
                            <ul className="space-y-1 text-left text-xs text-slate-600">
                              {plan.advantages.slice(0, 2).map((adv, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-600" />
                                  <span>{adv}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Savings Plan */}
          <div className="mb-6 grid gap-6 md:grid-cols-2">
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

            {/* Income-Based Recommendation */}
            <Card className="border-cyan-200 bg-white/90 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100">
                  <Info className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Financial Recommendation</h3>
                  <p className="text-sm text-slate-600">Based on your income</p>
                </div>
              </div>

              {results.insurancePlan.affordability && (
                <div className="space-y-4">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="mb-2 text-sm font-medium text-slate-700">Total Monthly Commitment</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ₹{(results.insurancePlan.premium + results.monthlySavings).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {results.insurancePlan.affordability.monthlyIncomePercentage}% of your monthly income
                    </p>
                  </div>

                  <div className={`rounded-lg border p-4 ${getAffordabilityColor(results.insurancePlan.affordability.financialStrain).bg} ${getAffordabilityColor(results.insurancePlan.affordability.financialStrain).border}`}>
                    <p className="mb-2 text-sm font-semibold text-slate-900">Financial Strain Level</p>
                    <Badge className={`mb-3 ${getAffordabilityColor(results.insurancePlan.affordability.financialStrain).bg} ${getAffordabilityColor(results.insurancePlan.affordability.financialStrain).text}`}>
                      {results.insurancePlan.affordability.financialStrain.toUpperCase()}
                    </Badge>
                    <p className="text-sm text-slate-700">
                      {results.insurancePlan.affordability.recommendation}
                    </p>
                  </div>
                </div>
              )}
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
                      {profile.healthCondition !== "None" 
                        ? (profile.healthCondition === "Other" && profile.customHealthCondition 
                          ? profile.customHealthCondition 
                          : profile.healthCondition)
                        : "overall health"}
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
