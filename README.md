# 🏥 CareFund

**AI-Powered Health Cost Prediction & Financial Safety Platform**

CareFund leverages advanced AI agents to analyze health profiles, environmental data, and lifestyle factors to predict potential medical costs and recommend personalized insurance plans for financial security.

![CareFund Demo](demo.gif)

## ✨ Features

- **🤖 Multi-Agent AI System**: Dual AI agents for comprehensive risk analysis and financial planning
- **📊 Real-Time Data Collection**: Fetches live environmental data (AQI, climate, crime statistics)
- **🎯 Personalized Risk Assessment**: Analyzes occupation hazards, health conditions, and location-based risks
- **💰 Smart Insurance Recommendations**: AI-powered insurance plan suggestions tailored to individual risk profiles
- **📈 Financial Planning**: Monthly savings strategies and emergency health fund recommendations
- **🔒 Secure Authentication**: NextAuth-based user authentication with MongoDB
- **📱 Responsive Dashboard**: Modern, intuitive interface built with React and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **AI/ML**: Google Gemini AI (gemini-2.5-pro)
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI, Shadcn/ui
- **Data Visualization**: Recharts
- **PDF Generation**: jsPDF

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- MongoDB database
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zahid-ind/care-fund
   cd care-fund
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory with reference to `.env.example`

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

1. **Sign Up**: Create an account with email and password
2. **Complete Profile**: Fill in personal details, health information, and location
3. **View Analysis**: Navigate to the dashboard to see environmental data
4. **Generate Report**: Get AI-powered health risk analysis and insurance recommendations
5. **Review Results**: View detailed risk factors, prevention steps, and financial planning advice
6. **Download Report**: Export your comprehensive health and financial report as PDF

## 🏗️ Project Structure

```
care-fund/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── agents/        # AI agent endpoints
│   │   ├── auth/          # Authentication routes
│   │   └── profile/       # User profile management
│   ├── dashboard/         # Dashboard pages
│   └── (auth)/            # Authentication pages
├── components/            # React components
│   └── ui/               # UI component library
├── lib/                   # Utility libraries
│   ├── services/         # Business logic services
│   ├── data/             # Static data and configurations
│   └── types/            # TypeScript type definitions
└── public/               # Static assets
```

## 🤖 AI Agent Architecture

### Agent 1: Collector & Analyzer
- Collects real-time environmental data (AQI, temperature, humidity)
- Fetches occupation hazard statistics
- Analyzes city-specific health risks
- Calculates comprehensive risk score
- Generates AI-powered health risk analysis using Gemini

### Agent 2: Financial Planner
- Recommends suitable insurance plans based on risk profile
- Provides monthly savings strategies
- Offers financial planning advice for healthcare costs
- Generates personalized financial security recommendations

## 📄 License

This project is developed for educational and demonstration purposes.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent health analysis
- Radix UI and Shadcn/ui for beautiful UI components
- Next.js team for the amazing framework

---

**Built with ❤️ for Mumbai Hacks**
