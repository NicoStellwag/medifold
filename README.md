# 🌿 Medifold - AI-Powered Health Insights Platform

## 🔍 Overview

Medifold is a platform that harnesses the power of o4-mini to transform healthcare by extracting actionable insights from complex and diverse data, ranging from selfies, medical reports to shopping receipts. Our mission is to enable a fundamental shift from reactive to proactive healthcare, empowering individuals with personalized, actionable health guidance derived from their own data to create a healthier society.

## 🚀 Deployment

The application is deployed and accessible at [https://medifold.netlify.app/](https://medifold.netlify.app/)

## 🛠️ Technical Implementation

### ✨ Core Features

- **Onboarding Flow**: Multi-step process capturing user health metrics (height, weight, age, sex) and preferences using React state management.
- **Authentication System**: Built with Supabase Auth, providing secure user authentication and session management.
- **Intelligent File Classification**: Uses o4-mini for content analysis of uploaded files (PDF, images) via the `/api/classify-file` endpoint.
- **Strava API Integration**: OAuth-based connection for automatic activity data import, processed and stored in Supabase.
- **Report Generation**: Processes user data through o4-mini via the `/api/generate-tips` endpoint to provide actionable insights.
- **Document Management**: Secure storage and retrieval system using Supabase storage buckets with client-side encryption.

### 🏗️ Architecture

- **Frontend**: Next.js 15 application with React 19 and TypeScript
- **Styling**: Tailwind CSS with custom theming
- **Component Library**: Custom UI components built on Radix UI primitives
- **State Management**: React Context API and hooks for application state
- **Animations**: Framer Motion for fluid UI transitions
- **Backend**: Serverless functions on Netlify with Supabase integration
- **Database**: PostgreSQL via Supabase
- **AI Processing**: o4-mini API integration for document analysis and insight generation
- **File Processing**: PDF.js for document handling and text extraction

### Directory Structure

```
/app                    # Next.js application routes
  /api                  # API routes for serverless functions
    /classify-file      # File classification endpoint
    /generate-tips      # Report generation endpoint
  /auth                 # Authentication pages
  /onboarding           # User onboarding flow
  /report               # Report generation and display
  /documents            # Document management

/components             # React components
  /onboarding           # Onboarding components
    /steps              # Individual onboarding screens
  /ui                   # Reusable UI components

/context                # React context providers
/hooks                  # Custom React hooks
/lib                    # Utility functions
/utils                  # Helper functions
  /supabase             # Supabase client utilities
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/medifold.git
   cd medifold
   ```

2. Install dependencies:

   ```
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Run the development server:

   ```
   npm run dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

Contributions are welcome. Please follow the standard GitHub flow:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
