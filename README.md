# LogicLens

**Stop Guessing. Start Understanding.**

LogicLens is an AI-powered code debugging tutor that helps Indian students and junior developers by asking diagnostic questions BEFORE explaining code. Built for the AI for Bharat hackathon.

## 🎯 Problem Statement

Early-stage developers (0-3 years experience) face a critical challenge: they often build incorrect mental models of how code works, leading to misdiagnosed bugs, extended debugging cycles, and reduced confidence. LogicLens addresses this by diagnosing reasoning gaps before providing explanations.

## 🚀 Features

- **Diagnostic-First Approach**: Answer questions about your code before seeing explanations
- **Logic Gap Detection**: Identify exactly where your mental model differs from actual behavior
- **Multilingual Support**: Available in Hindi and English for Indian developers
- **Mobile-First Design**: Optimized for 360px screens and low-bandwidth connections
- **AWS-Powered**: Built on AWS Amplify, Lambda, Bedrock, and DynamoDB

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: AWS Lambda (serverless functions)
- **AI**: Amazon Bedrock (Claude 3.5 Sonnet v2)
- **Database**: Amazon DynamoDB
- **Hosting**: AWS Amplify with CloudFront CDN
- **Code Editor**: Monaco Editor

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
NEXT_PUBLIC_BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
logic-lens/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles and design tokens
├── components/            # React components
├── lib/                   # Utility functions and helpers
│   ├── types.ts          # TypeScript type definitions
│   ├── constants.ts      # Application constants
│   └── utils.ts          # Utility functions
├── services/             # AWS service integrations
├── styles/               # Additional CSS modules
├── public/               # Static assets
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
- **Background**: `#F9FAFB` - Main background
- **Text**: `#111827` - Primary text

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

- Target: <$0.50 per session
- Budget: $100 AWS credits
- Response caching for similar code patterns
- Token limits to control Bedrock costs
- Efficient DynamoDB queries with GSI

## 🚀 Deployment

### AWS Amplify Deployment

1. Install Amplify CLI:
```bash
npm install -g @aws-amplify/cli
```

2. Initialize Amplify:
```bash
amplify init
```

3. Deploy:
```bash
amplify publish
```

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy to AWS Amplify Console or your preferred hosting platform.

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
