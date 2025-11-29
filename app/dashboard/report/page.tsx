"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Shield, Cloud, Thermometer, Droplets, User, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

interface EnvironmentalData {
  aqi: number
  temperature: number
  humidity: number
}

interface UserProfile {
  name: string
  city: string
  area: string
  age: string
  healthCondition: string
  customHealthCondition: string
  monthlyIncome: string
  pastSurgery: string
  addictions: string
  workShift: string
  occupation: string
}

export default function ReportPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [envData, setEnvData] = useState<EnvironmentalData | null>(null)
  const [healthScore, setHealthScore] = useState<number | null>(null)
  const [isLoadingEnv, setIsLoadingEnv] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

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

      const profileData: UserProfile = {
        name: data.name || session?.user?.name || "",
        city: data.city || "",
        area: data.area || "",
        age: data.age || "",
        healthCondition: data.healthCondition || "",
        customHealthCondition: data.customHealthCondition || "",
        monthlyIncome: data.monthlyIncome || "",
        pastSurgery: data.pastSurgery || "",
        addictions: data.addictions || "",
        workShift: data.workShift || "",
        occupation: data.occupation || "",
      }

      setProfile(profileData)
      setIsLoadingProfile(false)

      // Fetch environmental data
      fetchEnvironmentalData(data.city)
      
      // Load health score from previous analysis if available
      loadHealthScore()
    } catch (error) {
      console.error("[v0] Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
      setIsLoadingProfile(false)
    }
  }

  const fetchEnvironmentalData = async (city: string) => {
    setIsLoadingEnv(true)

    try {
      // Fetch real environmental data from our API
      const response = await fetch(`/api/environment?city=${encodeURIComponent(city)}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch environmental data")
      }

      const data = await response.json()
      
      setEnvData({
        aqi: data.aqi,
        temperature: data.temperature,
        humidity: data.humidity,
      })
    } catch (error) {
      console.error("[v0] Error fetching environmental data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch environmental data. Using estimated values.",
        variant: "destructive",
      })
      
      // Fallback to estimated data
      const fallbackData: Record<string, EnvironmentalData> = {
        Mumbai: { aqi: 165, temperature: 32, humidity: 68 },
        Delhi: { aqi: 220, temperature: 28, humidity: 55 },
        Bangalore: { aqi: 95, temperature: 26, humidity: 60 },
        Hyderabad: { aqi: 130, temperature: 30, humidity: 58 },
        Chennai: { aqi: 140, temperature: 33, humidity: 75 },
        Kolkata: { aqi: 180, temperature: 31, humidity: 70 },
        Pune: { aqi: 110, temperature: 29, humidity: 52 },
        Ahmedabad: { aqi: 150, temperature: 35, humidity: 45 },
        Jaipur: { aqi: 160, temperature: 34, humidity: 40 },
        Lucknow: { aqi: 190, temperature: 30, humidity: 62 },
      }
      
      setEnvData(fallbackData[city] || fallbackData["Mumbai"])
    } finally {
      setIsLoadingEnv(false)
    }
  }

  const getAQIStatus = (aqi: number) => {
    if (aqi <= 50) return { label: "Good", color: "bg-green-500", textColor: "text-green-700" }
    if (aqi <= 100) return { label: "Moderate", color: "bg-yellow-500", textColor: "text-yellow-700" }
    if (aqi <= 150) return { label: "Unhealthy for Sensitive", color: "bg-orange-500", textColor: "text-orange-700" }
    if (aqi <= 200) return { label: "Unhealthy", color: "bg-red-500", textColor: "text-red-700" }
    return { label: "Very Unhealthy", color: "bg-purple-500", textColor: "text-purple-700" }
  }

  const loadHealthScore = () => {
    try {
      const analysisResults = sessionStorage.getItem("analysisResults")
      if (analysisResults) {
        const results = JSON.parse(analysisResults)
        if (results.riskScore) {
          setHealthScore(results.riskScore)
        }
      }
    } catch (error) {
      console.error("[Report] Error loading health score:", error)
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

  const aqiStatus = envData ? getAQIStatus(envData.aqi) : null

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
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              Profile
            </Button>
            <span className="text-sm text-slate-600">Welcome, {session?.user?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Health Dashboard</h1>
          <p className="text-slate-600">Monitor your health metrics and environmental factors</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* User Profile Summary */}
          <Card className="border-cyan-200 bg-white/90 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-teal-600">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{profile.name}</h3>
                <p className="text-sm text-slate-600">{profile.age} years old</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-slate-700">Location:</span>
                <p className="text-slate-600">
                  {profile.city}, {profile.area}
                </p>
              </div>
              <div>
                <span className="font-medium text-slate-700">Occupation:</span>
                <p className="text-slate-600">{profile.occupation}</p>
              </div>
              <div>
                <span className="font-medium text-slate-700">Work Shift:</span>
                <p className="text-slate-600">{profile.workShift}</p>
              </div>
              <div>
                <span className="font-medium text-slate-700">Health Condition:</span>
                <p className="text-slate-600">
                  {profile.healthCondition === "Other" && profile.customHealthCondition
                    ? profile.customHealthCondition
                    : profile.healthCondition}
                </p>
              </div>
              <div>
                <span className="font-medium text-slate-700">Monthly Income:</span>
                <p className="text-slate-600">₹{profile.monthlyIncome ? Number(profile.monthlyIncome).toLocaleString('en-IN') : 'N/A'}</p>
              </div>
            </div>

            {/* Health Score */}
            <div className="mt-6 rounded-lg bg-gradient-to-br from-cyan-50 to-teal-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Health Score</span>
                {healthScore !== null ? (
                  <span className="text-2xl font-bold text-cyan-600">{healthScore}</span>
                ) : (
                  <span className="text-sm text-slate-500">Run analysis</span>
                )}
              </div>
              {healthScore !== null ? (
                <>
                  <Progress value={healthScore} className="h-2" />
                  <p className="mt-2 text-xs text-slate-600">/ 100</p>
                </>
              ) : (
                <div className="rounded bg-slate-100 py-2 text-center text-xs text-slate-500">
                  Complete AI analysis to see your health score
                </div>
              )}
            </div>
          </Card>

          {/* Environmental Data */}
          <div className="space-y-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Environmental Data</h2>
                <p className="text-sm text-slate-600">Live data for {profile.city}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchEnvironmentalData(profile.city)}
                disabled={isLoadingEnv}
              >
                {isLoadingEnv ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>

            {isLoadingEnv ? (
              <Card className="border-cyan-200 bg-white/90 p-12 text-center backdrop-blur-sm">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-cyan-600" />
                <p className="mt-4 text-slate-600">Loading environmental data...</p>
              </Card>
            ) : envData ? (
              <div className="grid gap-6 sm:grid-cols-3">
                {/* AQI Card */}
                <Card className="border-cyan-200 bg-white/90 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100">
                    <Cloud className="h-6 w-6 text-cyan-600" />
                  </div>
                  <h3 className="mb-1 text-sm font-medium text-slate-600">AQI</h3>
                  <p className="mb-2 text-3xl font-bold text-slate-900">{envData.aqi}</p>
                  {aqiStatus && <Badge className={`${aqiStatus.color} text-white`}>{aqiStatus.label}</Badge>}
                </Card>

                {/* Temperature Card */}
                <Card className="border-teal-200 bg-white/90 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                    <Thermometer className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="mb-1 text-sm font-medium text-slate-600">Temperature</h3>
                  <p className="text-3xl font-bold text-slate-900">{envData.temperature}°C</p>
                </Card>

                {/* Humidity Card */}
                <Card className="border-cyan-200 bg-white/90 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100">
                    <Droplets className="h-6 w-6 text-cyan-600" />
                  </div>
                  <h3 className="mb-1 text-sm font-medium text-slate-600">Humidity</h3>
                  <p className="text-3xl font-bold text-slate-900">{envData.humidity}%</p>
                </Card>
              </div>
            ) : null}

            {/* Generate Report Button */}
            {envData && (
              <Card className="border-cyan-200 bg-gradient-to-br from-cyan-600 to-teal-600 p-8 text-center backdrop-blur-sm">
                <h3 className="mb-2 text-2xl font-bold text-white">Ready for AI Analysis?</h3>
                <p className="mb-6 text-cyan-50">
                  Generate your personalized health cost prediction and financial safety report
                </p>
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full px-8"
                  onClick={() => router.push("/dashboard/analysis")}
                >
                  Run AI Prediction
                  <RefreshCw className="ml-2 h-5 w-5" />
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
