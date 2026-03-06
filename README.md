# LogicLens

**Stop Guessing. Start Understanding.**

🌐 **Live Demo**: [https://main.d3ll7vpnn6c9g6.amplifyapp.com](https://main.d3ll7vpnn6c9g6.amplifyapp.com)

LogicLens is an AI-powered code debugging tutor that helps Indian students and junior developers by asking diagnostic questions BEFORE explaining code. Built for the AI for Bharat hackathon.

## 🎯 Problem Statement

Early-stage developers (0-3 years experience) face a critical challenge: they often build incorrect mental models of how code works, leading to misdiagnosed bugs, extended debugging cycles, and reduced confidence. LogicLens addresses this by diagnosing reasoning gaps before providing explanations.

## 🚀 Features

- **Diagnostic-First Approach**: Answer questions about your code before seeing explanations
- **Logic Gap Detection**: Identify exactly where your mental model differs from actual behavior
- **Difficulty Levels**: Choose from Easy, Medium, and Hard question difficulty
- **Voice Input**: Answer questions using your microphone (Web Speech API)
- **Gamification**: Earn streaks and badges as you improve your debugging skills
- **Shareable Results**: Generate and share a visual results card of your session
- **Copy Optimal Code**: One-click copy of the AI-suggested improved code
- **Multilingual Support**: Available in Hindi and English for Indian developers
- **Mobile-First Design**: Optimized for 360px screens and low-bandwidth connections
- **AWS-Powered**: Built on AWS Amplify, Lambda, Bedrock, and DynamoDB

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: AWS Lambda (serverless functions)
- **AI**: Amazon Bedrock (Amazon Nova Lite 2) — chosen for cost efficiency ($0.006/session with caching)
- **Database**: Amazon DynamoDB
- **Hosting**: AWS Amplify with CloudFront CDN
- **Code Editor**: Monaco Editor
- **Voice**: Web Speech API (browser-native, no extra cost)

## 📋 Prerequisites

- Node.js 18+ and npm
- AWS Account with Bedrock access
- AWS CLI configured with credentials

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd logic-lens
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your AWS credentials:
```env
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
NEXT_PUBLIC_API_URL=your_api_gateway_url
NEXT_PUBLIC_DEMO_MODE=false
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser, or visit the live deployment at [https://main.d3ll7vpnn6c9g6.amplifyapp.com](https://main.d3ll7vpnn6c9g6.amplifyapp.com).

## 📁 Project Structure

```
logic-lens/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page
│   ├── workspace/         # Main workspace page
│   └── globals.css        # Global styles and design tokens
├── components/            # React components
│   ├── CodeEditor.tsx     # Monaco-based code editor
│   ├── QuestionPanel.tsx  # Diagnostic question UI
│   ├── ResultsPanel.tsx   # Gap analysis results with copy optimal code
│   ├── ContextSelector.tsx# Language and difficulty selector
│   ├── VoiceInput.tsx     # Voice answer input component
│   ├── BadgesDisplay.tsx  # Gamification badges UI
│   └── ShareResultsCard.tsx # Shareable session results card
├── hooks/
│   └── useGameProgress.ts # Streaks, badges, and gamification logic
├── lambda/                # AWS Lambda functions
│   ├── question-generation/ # Generates diagnostic questions via Bedrock
│   ├── gap-detection/     # Analyzes answers and detects logic gaps
│   └── refactor-code/     # Suggests optimized code via Bedrock
├── services/
│   └── aws-config.ts     # AWS service config and API helpers
├── lib/                   # Utility functions and helpers
│   ├── types.ts          # TypeScript type definitions
│   ├── constants.ts      # Application constants
│   └── utils.ts          # Utility functions
├── public/               # Static assets (logo, icons)
├── infrastructure/       # AWS CDK / IaC definitions
├── tailwind.config.ts    # Tailwind CSS configuration
├── next.config.js        # Next.js configuration
├── amplify.yml           # AWS Amplify build configuration
└── tsconfig.json         # TypeScript configuration
```

## 🎨 Design System

### Colors
- **Primary (Indigo)**: `#4F46E5` - Actions, CTAs, focus indicators
- **Secondary (Cyan)**: `#22D3EE` - Links, highlights, success states
- **Warning (Amber)**: `#F59E0B` - Reasoning gaps, warnings
- **Success (Emerald)**: `#10B981` - Correct reasoning, success states
- **Background**: `#0F172A` - Dark mode main background
- **Text**: `#F1F5F9` - Primary text

### Typography
- **Headings**: Inter (Semi-Bold 600)
- **Body**: Inter (Regular 400)
- **Code**: JetBrains Mono

### Breakpoints
- Mobile: `< 768px` (Primary focus)
- Tablet: `768px - 1279px`
- Desktop: `1280px+`

## 🌐 Multilingual Support

LogicLens supports both English and Hindi:
- UI localization with language toggle
- Questions generated in user's preferred language
- Technical term glossary (variable → चर, function → फ़ंक्शन)
- Hinglish code comment support

## 📱 Mobile-First Optimization

- Designed for 360px width (most common mobile screen)
- Touch-friendly targets (44px minimum)
- Low-bandwidth mode for 2G/3G connections
- Simplified UI with system fonts in low-bandwidth mode
- Target: <100KB initial page load in low-bandwidth mode

## 🔒 Security

- No code storage beyond session duration (24 hours)
- No user authentication required (privacy-first)
- Input sanitization to prevent injection attacks
- HTTPS enforced with security headers
- Rate limiting: 50 requests/hour per IP

## 💰 Cost Optimization

- **~$0.006 per session** using Amazon Nova Lite 2 + response caching
- Serve **~16,666 sessions on just $100** of AWS credits
- Response caching eliminates redundant Bedrock calls for similar code patterns
- Token limits to control Bedrock costs
- Efficient DynamoDB queries with GSI
- Voice input via browser-native Web Speech API (zero extra cost)

## 🚀 Deployment

### AWS Amplify Deployment

1. Connect your GitHub repository to AWS Amplify Console
2. Set environment variables in Amplify Console settings
3. Amplify auto-deploys on every push to `main`

### Lambda Functions

Deploy Lambda functions individually or via the infrastructure scripts:
```bash
cd lambda/question-generation && npm install
cd lambda/gap-detection && npm install
cd lambda/refactor-code && npm install
```

### Manual Build

```bash
npm run build
```

## 📊 Performance Targets

- **First Contentful Paint**: <2 seconds (3G)
- **Time to Interactive**: <5 seconds (3G)
- **Total Page Weight**: <500KB (normal), <100KB (low-bandwidth)
- **API Response Time**: <3 seconds (question generation)
- **Lighthouse Score**: 90+ (Performance, Accessibility)

## 🧪 Testing

Run tests:
```bash
npm test
```

Run linting:
```bash
npm run lint
```

## 📝 License

This project is built for the AI for Bharat hackathon.

## 🤝 Contributing

This is a hackathon project. Contributions are welcome after the hackathon concludes.

## 📧 Contact

For questions or feedback, please reach out to the LogicLens team.

---

Built with ❤️ for Indian developers by the LogicLens team.
