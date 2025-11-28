import Link from "next/link"
import { Shield, TrendingUp, Activity, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <header className="border-b border-white/50 bg-white/70 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-cyan-600" />
            <span className="text-2xl font-bold text-slate-900">CareFund</span>
          </div>
          <Link href="/login">
            <Button variant="outline" className="rounded-full bg-transparent">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-900">
            <Activity className="h-4 w-4" />
            AI-Powered Health & Financial Intelligence
          </div>

          <h1 className="mb-6 text-balance text-5xl font-bold leading-tight text-slate-900 md:text-6xl">
            Predict Health Costs,
            <span className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              {" "}
              Secure Your Future
            </span>
          </h1>

          <p className="mb-8 text-pretty text-xl leading-relaxed text-slate-600">
            CareFund uses advanced AI agents to analyze your health profile, environmental data, and lifestyle factors
            to predict potential medical costs and recommend personalized insurance plans for financial safety.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button
                size="lg"
                className="rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 px-8 text-lg hover:from-cyan-700 hover:to-teal-700"
              >
                Get Started
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="rounded-full px-8 text-lg bg-transparent">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">How CareFund Works</h2>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          <Card className="border-cyan-200 bg-white/80 p-6 backdrop-blur-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100">
              <Activity className="h-6 w-6 text-cyan-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-slate-900">Data Collection</h3>
            <p className="leading-relaxed text-slate-600">
              Collect your health profile, lifestyle factors, and real-time environmental data from your city including
              AQI and climate conditions.
            </p>
          </Card>

          <Card className="border-teal-200 bg-white/80 p-6 backdrop-blur-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
              <TrendingUp className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-slate-900">AI Analysis</h3>
            <p className="leading-relaxed text-slate-600">
              Our AI agents analyze risk factors including occupation hazards, pollution levels, and health conditions
              to predict future medical costs.
            </p>
          </Card>

          <Card className="border-cyan-200 bg-white/80 p-6 backdrop-blur-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100">
              <Shield className="h-6 w-6 text-cyan-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-slate-900">Smart Recommendations</h3>
            <p className="leading-relaxed text-slate-600">
              Receive personalized insurance plans and monthly savings suggestions to ensure financial safety for your
              healthcare needs.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="border-cyan-200 bg-gradient-to-br from-cyan-600 to-teal-600 p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">Ready to Secure Your Health Future?</h2>
          <p className="mb-8 text-lg text-cyan-50">
            Join CareFund today and get AI-powered health cost predictions tailored for India.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="rounded-full px-8 text-lg">
              Create Your Free Account
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/70 py-8 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-slate-600">
          <p>&copy; 2025 CareFund. AI-Powered Health Cost Prediction & Financial Safety.</p>
        </div>
      </footer>
    </div>
  )
}
