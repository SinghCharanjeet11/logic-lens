// Application constants

export const APP_CONFIG = {
  name: 'LogicLens',
  version: '0.1.0',
  maxCodeLines: 500,
  minCodeLines: 10,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  apiTimeout: 30000, // 30 seconds
  rateLimit: {
    maxRequests: 50,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;

export const BREAKPOINTS = {
  xs: 360,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const SUPPORTED_LANGUAGES = {
  javascript: { name: 'JavaScript', extensions: ['.js', '.jsx'] },
  typescript: { name: 'TypeScript', extensions: ['.ts', '.tsx'] },
  python: { name: 'Python', extensions: ['.py'] },
  java: { name: 'Java', extensions: ['.java'] },
  go: { name: 'Go', extensions: ['.go'] },
} as const;

export const CONTEXT_OPTIONS = [
  {
    value: 'understanding' as const,
    label: 'Understanding Logic',
    description: 'I want to understand how this code works',
  },
  {
    value: 'debugging' as const,
    label: 'Debugging Issue',
    description: 'I have a bug and need to find the root cause',
  },
  {
    value: 'optimizing' as const,
    label: 'Optimizing Performance',
    description: 'I want to improve the code performance',
  },
] as const;

export const UI_TEXT = {
  en: {
    header: {
      title: 'LogicLens',
      languageToggle: 'हिं / EN',
    },
    hero: {
      title: 'Stop Guessing. Start Understanding.',
      subtitle: 'Diagnose your code reasoning gaps before debugging',
      cta: 'Paste Code & Check Reasoning →',
    },
    valueProps: {
      diagnose: {
        title: 'Diagnose First',
        description: 'Answer targeted questions about your code before seeing explanations',
      },
      gaps: {
        title: 'Find Logic Gaps',
        description: 'Identify exactly where your mental model differs from actual behavior',
      },
      confidence: {
        title: 'Build Confidence',
        description: 'Develop systematic reasoning skills for any codebase',
      },
    },
  },
  hi: {
    header: {
      title: 'LogicLens',
      languageToggle: 'EN / हिं',
    },
    hero: {
      title: 'अनुमान लगाना बंद करें। समझना शुरू करें।',
      subtitle: 'डिबगिंग से पहले अपने कोड तर्क में कमियों का पता लगाएं',
      cta: 'कोड पेस्ट करें और तर्क जांचें →',
    },
    valueProps: {
      diagnose: {
        title: 'पहले निदान करें',
        description: 'स्पष्टीकरण देखने से पहले अपने कोड के बारे में लक्षित प्रश्नों के उत्तर दें',
      },
      gaps: {
        title: 'तर्क में कमियां खोजें',
        description: 'पता करें कि आपका मानसिक मॉडल वास्तविक व्यवहार से कहां अलग है',
      },
      confidence: {
        title: 'आत्मविश्वास बढ़ाएं',
        description: 'किसी भी कोडबेस के लिए व्यवस्थित तर्क कौशल विकसित करें',
      },
    },
  },
} as const;

export const ERROR_MESSAGES = {
  en: {
    invalidCode: 'We couldn\'t parse this code. Please check for syntax errors.',
    codeTooShort: 'Please paste at least 10 lines of code for meaningful analysis.',
    codeTooLong: 'Your code exceeds the 500-line limit. Please focus on the confusing part.',
    networkError: 'You\'re offline. Check your internet connection and try again.',
    apiError: 'Our AI is taking a break. Please try again in a moment.',
    timeout: 'Request timed out. This is taking longer than expected.',
    rateLimitExceeded: 'You\'ve reached the hourly limit. Try again later.',
  },
  hi: {
    invalidCode: 'हम इस कोड को पार्स नहीं कर सके। कृपया सिंटैक्स त्रुटियों की जांच करें।',
    codeTooShort: 'सार्थक विश्लेषण के लिए कृपया कम से कम 10 लाइनें कोड पेस्ट करें।',
    codeTooLong: 'आपका कोड 500-लाइन सीमा से अधिक है। कृपया भ्रमित करने वाले हिस्से पर ध्यान दें।',
    networkError: 'आप ऑफ़लाइन हैं। अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।',
    apiError: 'हमारा AI ब्रेक ले रहा है। कृपया एक क्षण में पुनः प्रयास करें।',
    timeout: 'अनुरोध समय समाप्त हो गया। यह अपेक्षा से अधिक समय ले रहा है।',
    rateLimitExceeded: 'आप प्रति घंटा सीमा तक पहुंच गए हैं। बाद में पुनः प्रयास करें।',
  },
} as const;

export const LOCAL_STORAGE_KEYS = {
  language: 'logiclens_language',
  lowBandwidthMode: 'logiclens_low_bandwidth',
  onboardingCompleted: 'logiclens_onboarding_completed',
  sessionData: 'logiclens_session',
} as const;
