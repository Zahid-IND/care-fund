"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Shield, User, MapPin, Briefcase, Heart, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

const INDIAN_CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
]

const OCCUPATIONS = [
  "IT Professional",
  "Healthcare Worker",
  "Teacher",
  "Engineer",
  "Business Owner",
  "Factory Worker",
  "Driver",
  "Student",
  "Other",
]

const HEALTH_CONDITIONS = [
  "None",
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Heart Disease",
  "Thyroid",
  "Arthritis",
  "Other",
]

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [profileCompleted, setProfileCompleted] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    area: "",
    age: "",
    healthCondition: "",
    pastSurgery: "",
    addictions: "",
    workShift: "",
    occupation: "",
  })

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

      if (data.profileCompleted !== false) {
        setFormData({
          name: data.name || session?.user?.name || "",
          city: data.city || "",
          area: data.area || "",
          age: data.age || "",
          healthCondition: data.healthCondition || "",
          pastSurgery: data.pastSurgery || "",
          addictions: data.addictions || "",
          workShift: data.workShift || "",
          occupation: data.occupation || "",
        })
        setProfileCompleted(true)
      } else {
        setFormData((prev) => ({ ...prev, name: session?.user?.name || "" }))
      }
    } catch (error) {
      console.error("[v0] Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to save profile")
      }

      setProfileCompleted(true)
      setShowProfileForm(false)

      toast({
        title: "Success",
        description: "Profile saved successfully",
      })
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
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

  if (status === "unauthenticated") {
    return null
  }

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
            <span className="text-sm text-slate-600">Welcome, {session?.user?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!profileCompleted && !showProfileForm && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900">
              Please complete your profile to get personalized health predictions and insurance recommendations.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="border-cyan-200 bg-white/90 p-6 backdrop-blur-sm lg:col-span-1">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-teal-600">
                <User className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{session?.user?.name}</h2>
              {profileCompleted ? (
                <Badge className="mt-2 bg-green-100 text-green-800">Profile Complete</Badge>
              ) : (
                <Badge variant="outline" className="mt-2 border-amber-200 text-amber-800">
                  Profile Incomplete
                </Badge>
              )}
            </div>

            {profileCompleted && (
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
                  <div>
                    <p className="font-medium text-slate-900">{formData.city}</p>
                    <p className="text-slate-600">{formData.area}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">{formData.occupation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">{formData.age} years old</span>
                </div>
              </div>
            )}

            <Button
              onClick={() => setShowProfileForm(!showProfileForm)}
              variant={profileCompleted ? "outline" : "default"}
              className={`mt-6 w-full ${!profileCompleted && "bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"}`}
            >
              {profileCompleted ? "Update Profile" : "Complete Profile"}
            </Button>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {showProfileForm ? (
              <Card className="border-cyan-200 bg-white/90 p-6 backdrop-blur-sm">
                <h3 className="mb-6 text-2xl font-bold text-slate-900">
                  {profileCompleted ? "Update Your Profile" : "Complete Your Profile"}
                </h3>

                <form onSubmit={handleSubmitProfile} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        placeholder="Priya Sharma"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        required
                        placeholder="34"
                        min="1"
                        max="120"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Select
                        value={formData.city}
                        onValueChange={(value) => handleInputChange("city", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDIAN_CITIES.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area">Area/Locality</Label>
                      <Input
                        id="area"
                        type="text"
                        value={formData.area}
                        onChange={(e) => handleInputChange("area", e.target.value)}
                        required
                        placeholder="Andheri West"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Select
                        value={formData.occupation}
                        onValueChange={(value) => handleInputChange("occupation", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select occupation" />
                        </SelectTrigger>
                        <SelectContent>
                          {OCCUPATIONS.map((occupation) => (
                            <SelectItem key={occupation} value={occupation}>
                              {occupation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workShift">Work Shift</Label>
                      <Select
                        value={formData.workShift}
                        onValueChange={(value) => handleInputChange("workShift", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select work shift" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Day">Day Shift</SelectItem>
                          <SelectItem value="Night">Night Shift</SelectItem>
                          <SelectItem value="Rotating">Rotating Shift</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="healthCondition">Current Health Condition</Label>
                      <Select
                        value={formData.healthCondition}
                        onValueChange={(value) => handleInputChange("healthCondition", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {HEALTH_CONDITIONS.map((condition) => (
                            <SelectItem key={condition} value={condition}>
                              {condition}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pastSurgery">Past Major Surgery</Label>
                      <Input
                        id="pastSurgery"
                        type="text"
                        value={formData.pastSurgery}
                        onChange={(e) => handleInputChange("pastSurgery", e.target.value)}
                        placeholder="None or specify"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="addictions">Addictions (if any)</Label>
                      <Input
                        id="addictions"
                        type="text"
                        value={formData.addictions}
                        onChange={(e) => handleInputChange("addictions", e.target.value)}
                        placeholder="Smoking, alcohol, etc. or None"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
                    >
                      Save Profile
                    </Button>
                    {profileCompleted && (
                      <Button type="button" variant="outline" onClick={() => setShowProfileForm(false)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            ) : (
              <Card className="border-cyan-200 bg-white/90 p-6 backdrop-blur-sm">
                {profileCompleted ? (
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <Heart className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-slate-900">Profile Complete!</h3>
                    <p className="mb-6 text-slate-600">
                      Your profile is ready. Continue to the next sections to view environmental data and generate your
                      AI health report.
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard/report")}
                      className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
                    >
                      View Dashboard
                      <RefreshCw className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <AlertCircle className="mx-auto mb-4 h-16 w-16 text-amber-500" />
                    <h3 className="mb-2 text-2xl font-bold text-slate-900">Complete Your Profile</h3>
                    <p className="text-slate-600">
                      Please fill in your profile information to get started with AI-powered health predictions.
                    </p>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
