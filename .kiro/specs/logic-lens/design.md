# LogicLens - Design Specification

## 1. Design Philosophy

### Core Principles

**Diagnose Before Teaching**
- The system acts as a diagnostic tool first, educator second
- No explanations appear until reasoning gaps are identified
- Questions drive the interaction, not answers

**Minimal But Intelligent UI**
- Every element serves a clear purpose
- No decorative features or unnecessary chrome
- Information hierarchy guides natural workflow

**Feels Like a Senior Developer Review**
- Tone is professional, not patronizing
- Questions feel like pair programming dialogue
- Feedback is constructive and specific

### Design Differentiation from Generic AI Tools

| Generic Chatbot | LogicLens |
|----------------|---------------|
| "Ask me anything" | "Let me check your reasoning" |
| Open text box | Structured code input |
| Immediate answers | Questions first, answers later |
| Generic responses | Code-specific diagnostics |
| Conversational | Systematic |

## 2. Color Palette

### Primary Colors

**Indigo #4F46E5**
- Primary actions and CTAs
- Active states and focus indicators
- Question headers and key UI elements
- Conveys intelligence and precision

**Cyan #22D3EE**
- Secondary actions and links
- Code highlights and annotations
- Success states for correct reasoning
- Adds energy without overwhelming

### Neutral Colors

**Off-white #F9FAFB**
- Main background
- Reduces eye strain during extended use
- Professional, clean appearance

**Dark Slate #111827**
- Primary text color
- High contrast for readability
- Code editor text

### Semantic Colors

**Amber #F59E0B**
- Warning states
- Reasoning gaps and misconceptions
- "Needs attention" indicators
- Highlights confusion points

**Emerald #10B981**
- Success states
- Correct reasoning confirmation
- Clarity achieved indicators
- Positive reinforcement

### Usage Guidelines

- Use Indigo sparingly for maximum impact
- Amber only for genuine reasoning gaps (not decorative)
- Emerald for validation, not celebration
- Maintain 4.5:1 contrast ratio minimum (WCAG AA)

## 3. Typography

### Font Families

**Inter (Headings & UI)**
- Weights: Semi-Bold (600) for headings, Regular (400) for body
- Clean, modern, highly legible
- Excellent at small sizes

**JetBrains Mono (Code)**
- Monospace font optimized for developers
- Clear distinction between similar characters (0/O, 1/l/I)
- Ligature support for common operators

### Type Scale

```
H1: 32px / 2rem - Semi-Bold - Page title
H2: 24px / 1.5rem - Semi-Bold - Section headers
H3: 20px / 1.25rem - Semi-Bold - Subsection headers
Body: 16px / 1rem - Regular - Main content
Small: 14px / 0.875rem - Regular - Helper text
Code: 14px / 0.875rem - JetBrains Mono - Code blocks
```

### Line Height

- Body text: 1.6 (optimal readability)
- Headings: 1.2 (tighter, more impact)
- Code: 1.5 (breathing room for syntax)

## 4. Layout Structure

### Single-Page Workspace

**Three-Column Layout (Desktop)**

```
┌─────────────────────────────────────────────────────────────┐
│                      LogicLens Header                        │
├──────────────┬──────────────────┬─────────────────────────┤
│              │                  │                         │
│  Code Input  │  Reasoning Check │  Understanding Panel    │
│              │                  │                         │
│  (Left)      │  (Center)        │  (Right)                │
│  35% width   │  30% width       │  35% width              │
│              │                  │                         │
│              │                  │                         │
│              │                  │                         │
└──────────────┴──────────────────┴─────────────────────────┘
│                    Action Panel (Bottom)                     │
└─────────────────────────────────────────────────────────────┘
```

**Responsive Behavior**
- Tablet (768px-1024px): Two columns (Code + Active Panel)
- Mobile (<768px): Single column, accordion-style sections

### Grid System

- 12-column grid
- 24px gutter spacing
- 80px max-width container padding
- Breakpoints: 640px, 768px, 1024px, 1280px, 1536px

## 5. Screen-by-Screen UX

### 5.0 First-Time User Onboarding

**Purpose:** Help new users understand LogicLens workflow without overwhelming them

**Trigger:** First visit (detected via localStorage flag)

**Onboarding Steps:**

**Step 1: Welcome Modal**
```
┌─────────────────────────────────────────┐
│  Welcome to LogicLens! 🔍              │
│                                         │
│  We help you understand code by         │
│  testing your reasoning first.          │
│                                         │
│  Here's how it works:                   │
│  1️⃣ Paste your code                     │
│  2️⃣ Answer targeted questions           │
│  3️⃣ Get personalized diagnosis          │
│  4️⃣ See exactly where you're confused   │
│                                         │
│  [Start Tour] [Skip, I'll explore]      │
└─────────────────────────────────────────┘
```

**Step 2: Code Editor Tooltip**
```
┌─────────────────────────────────────────┐
│  👈 Paste code you want to understand   │
│                                         │
│  Try this example:                      │
│  [Load Sample Code]                     │
│                                         │
│  Or paste your own code here ↓          │
└─────────────────────────────────────────┘
```

**Step 3: Context Selector Highlight**
```
┌─────────────────────────────────────────┐
│  Choose your goal:                      │
│  ○ Understanding Logic ← Start here!    │
│  ○ Debugging Issue                      │
│  ○ Optimizing Performance               │
│                                         │
│  This helps us ask the right questions  │
└─────────────────────────────────────────┘
```

**Step 4: Sample Question Preview**
```
┌─────────────────────────────────────────┐
│  We'll ask questions like:              │
│                                         │
│  "What value does result hold after     │
│   line 15 when input is []?"            │
│                                         │
│  These reveal gaps in your mental model │
│                                         │
│  [Got it, let's start!]                 │
└─────────────────────────────────────────┘
```

**Step 5: Workflow Overview**
```
┌─────────────────────────────────────────┐
│  Your Journey:                          │
│                                         │
│  Paste Code → Answer Questions →        │
│  Get Diagnosis → See Gaps → Learn!      │
│                                         │
│  ⏱️ Takes ~3 minutes                     │
│                                         │
│  [Start Analyzing]                      │
└─────────────────────────────────────────┘
```

**Onboarding Controls:**
- "Skip Tour" button always visible
- "Don't show again" checkbox
- Progress dots (1/5, 2/5, etc.)
- Keyboard shortcut: Esc to skip

**Returning Users:**
- No onboarding shown
- "Show Tutorial" link in header (for reference)

---

### 5.1 Landing Page

**Hero Section**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              Stop Guessing. Start Understanding.            │
│                                                             │
│     Diagnose your code reasoning gaps before debugging      │
│                                                             │
│              [Paste Code & Check Reasoning →]               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Copy:**
- Headline: "Stop Guessing. Start Understanding."
- Subheadline: "Diagnose your code reasoning gaps before debugging"
- CTA: "Paste Code & Check Reasoning →"

**Value Propositions (3 cards below hero):**

1. **Diagnose First**
   - Icon: Stethoscope
   - "Answer targeted questions about your code before seeing explanations"

2. **Find Logic Gaps**
   - Icon: Puzzle piece
   - "Identify exactly where your mental model differs from actual behavior"

3. **Build Confidence**
   - Icon: Shield check
   - "Develop systematic reasoning skills for any codebase"

### 5.2 Code Input Panel (Left Column)

**Header:**
- Title: "Your Code"
- Subtitle: "Paste the code you want to understand"

**Components:**

1. **Code Editor**
   - Monaco editor integration
   - Syntax highlighting (auto-detect language)
   - Line numbers
   - 500-line limit indicator
   - Paste detection with auto-format

2. **Context Selector (Below editor)**
   - Radio buttons (single select)
   - Options:
     - ○ Understanding Logic
     - ○ Debugging Issue
     - ○ Optimizing Performance
   - Helper text: "This helps us ask the right questions"

3. **Optional: Error Message Input**
   - Collapsible section
   - Text area for stack traces
   - Only visible if "Debugging Issue" selected

**States:**
- Empty: Placeholder with example snippet
- Filled: Code with syntax highlighting
- Error: Red border if invalid input

### 5.3 Reasoning Question Panel (Center Column)

**Header:**
- Title: "Check Your Reasoning"
- Subtitle: "Answer these questions about your code"

**States:**

**State 1: Waiting (Before code input)**
```
┌─────────────────────────────────┐
│                                 │
│    [Icon: Clipboard question]   │
│                                 │
│  Questions will appear here     │
│  after you paste your code      │
│                                 │
└─────────────────────────────────┘
```

**State 2: Generating (Loading)**
```
┌─────────────────────────────────┐
│                                 │
│    [Animated spinner]           │
│                                 │
│  Analyzing your code...         │
│  Generating questions...        │
│                                 │
└─────────────────────────────────┘
```

**State 3: Questions Ready**

```
┌─────────────────────────────────────────┐
│ Question 1 of 4                         │
│                                         │
│ What value does `result` hold after    │
│ line 15 executes when `input` is []?   │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Your answer...                      │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Not sure? Skip this question]          │
│                                         │
│ [← Previous]  [Next →]  [Submit All]    │
└─────────────────────────────────────────┘
```

**Question Card Design:**
- Question number badge (Indigo background)
- Question text (Dark Slate, 18px)
- Text area for answer (white background, border)
- "Skip" link (Cyan, subtle)
- Navigation buttons (Indigo primary, gray secondary)

**Interaction:**
- One question visible at a time
- Progress indicator (dots or bar)
- Answers auto-saved to session
- "Submit All" button appears on last question

### 5.4 Understanding & Explanation Panel (Right Column)

**Header:**
- Title: "Your Understanding"
- Subtitle: Changes based on state

**States:**

**State 1: Waiting**
```
┌─────────────────────────────────┐
│                                 │
│    [Icon: Lightbulb off]        │
│                                 │
│  Your personalized explanation  │
│  will appear after you submit   │
│  your answers                   │
│                                 │
└─────────────────────────────────┘
```

**State 2: Analyzing**
```
┌─────────────────────────────────┐
│                                 │
│    [Animated brain icon]        │
│                                 │
│  Analyzing your reasoning...    │
│  Identifying gaps...            │
│                                 │
└─────────────────────────────────┘
```

**State 3: Results**

```
┌──────────────────────────────────────────┐
│ Reasoning Gaps Detected                  │
│                                          │
│ ⚠️ Critical Misunderstanding (1)         │
│ ┌────────────────────────────────────┐   │
│ │ You assumed `input` is never null  │   │
│ │ Line 12 will throw error if null   │   │
│ │ [See explanation →]                │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ⚠️ Logic Flow Gap (2)                    │
│ ┌────────────────────────────────────┐   │
│ │ Missed early return on line 8      │   │
│ │ [See explanation →]                │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ✓ Correct Understanding (2)              │
│ You correctly identified...              │
│                                          │
└──────────────────────────────────────────┘
```

**Gap Card Design:**
- Severity icon (⚠️ Amber for gaps, ✓ Emerald for correct)
- Gap title (Semi-Bold, 16px)
- Brief description
- Expandable explanation section
- Code snippet with annotation

**Explanation Section (Expanded):**
```
┌──────────────────────────────────────────┐
│ Why This Matters                         │
│                                          │
│ Your answer: "result will be 0"          │
│ Actual behavior: "result will be null"   │
│                                          │
│ Here's what's happening:                 │
│                                          │
│ 12 │ const result = input.reduce(...)   │
│    │        ↑                            │
│    │ Throws TypeError if input is null   │
│                                          │
│ The reduce() method requires an array.   │
│ Add null check before line 12.           │
│                                          │
│ [See refactored code ↓]                  │
└──────────────────────────────────────────┘
```

### 5.5 Action Panel (Bottom)

**Appears after analysis complete**

```
┌─────────────────────────────────────────────────────────────┐
│  [📋 Copy Refactored Code]  [✓ View Checklist]  [↻ Retry]  │
└─────────────────────────────────────────────────────────────┘
```

**Buttons:**
1. **Copy Refactored Code**: Copies improved version to clipboard
2. **View Checklist**: Opens modal with reasoning checklist
3. **Retry**: Clear session and start over

**Checklist Modal:**
```
┌─────────────────────────────────────────┐
│ Reasoning Checklist for Similar Code   │
│                                         │
│ Before debugging, always check:         │
│ □ Null/undefined input handling         │
│ □ Empty array/object edge cases         │
│ □ Early return conditions               │
│ □ Error handling in async calls         │
│                                         │
│ [Copy Checklist]  [Close]               │
└─────────────────────────────────────────┘
```

---

### 5.6 Error States (Comprehensive)

**Design Philosophy:** Clear, helpful, actionable error messages

#### Error 1: Invalid Code Input

**Scenario:** User pastes non-code text or malformed code

```
┌──────────────────────────────────────────┐
│  ⚠️ We couldn't parse this code          │
│                                          │
│  This doesn't look like valid code.      │
│  Please check for:                       │
│  • Syntax errors                         │
│  • Missing brackets or semicolons        │
│  • At least 10 lines of code             │
│                                          │
│  [Try Again]  [Load Sample Code]         │
└──────────────────────────────────────────┘
```

**Visual Design:**
- Amber background (#FFFBEB)
- Warning icon (⚠️)
- Bullet points for clarity
- Two action buttons

---

#### Error 2: Code Too Short

```
┌──────────────────────────────────────────┐
│  📏 Code is too short                    │
│                                          │
│  Please paste at least 10 lines of code │
│  for meaningful analysis.                │
│                                          │
│  Current: 5 lines                        │
│  Required: 10+ lines                     │
│                                          │
│  [Add More Code]                         │
└──────────────────────────────────────────┘
```

---

#### Error 3: Code Too Long

```
┌──────────────────────────────────────────┐
│  📄 Code exceeds limit                   │
│                                          │
│  Your code has 650 lines.                │
│  Maximum: 500 lines                      │
│                                          │
│  💡 Tip: Focus on the confusing part     │
│  (20-50 lines work best)                 │
│                                          │
│  [Edit Code]                             │
└──────────────────────────────────────────┘
```

---

#### Error 4: AI Service Unavailable

```
┌──────────────────────────────────────────┐
│  🔌 Our AI is taking a break             │
│                                          │
│  We're experiencing high demand.         │
│  Your code is saved.                     │
│                                          │
│  Please try again in a moment.           │
│                                          │
│  [Retry Now]  [Try Later]                │
│                                          │
│  Retrying automatically in 10s...        │
└──────────────────────────────────────────┘
```

**Features:**
- Auto-retry countdown
- Code saved notification (reassurance)
- Manual retry option

---

#### Error 5: Session Expired

```
┌──────────────────────────────────────────┐
│  ⏰ Your session expired                 │
│                                          │
│  Good news: We saved your answers!       │
│                                          │
│  Click below to continue where you       │
│  left off.                               │
│                                          │
│  [Continue] [Start Fresh]                │
└──────────────────────────────────────────┘
```

**Features:**
- Positive framing ("Good news")
- Two clear options
- Auto-restore from localStorage

---

#### Error 6: Network Error (Offline)

```
┌──────────────────────────────────────────┐
│  📡 You're offline                       │
│                                          │
│  Check your internet connection and      │
│  try again.                              │
│                                          │
│  Your work is saved locally.             │
│                                          │
│  [Retry]                                 │
│                                          │
│  Status: Checking connection...          │
└──────────────────────────────────────────┘
```

**Features:**
- Auto-detect when back online
- Reassurance about saved work
- Connection status indicator

---

#### Error 7: Request Timeout

```
┌──────────────────────────────────────────┐
│  ⏱️ Request timed out                    │
│                                          │
│  This is taking longer than expected.    │
│                                          │
│  Possible reasons:                       │
│  • Slow internet connection              │
│  • Complex code (try smaller section)    │
│  • High server load                      │
│                                          │
│  [Retry]  [Simplify Code]                │
└──────────────────────────────────────────┘
```

---

#### Error 8: Rate Limit Exceeded

```
┌──────────────────────────────────────────┐
│  🚦 Slow down there!                     │
│                                          │
│  You've reached the hourly limit:        │
│  50 analyses per hour                    │
│                                          │
│  Try again in: 23 minutes                │
│                                          │
│  💡 Tip: Take a break and review your    │
│  previous analyses!                      │
│                                          │
│  [View Past Analyses]                    │
└──────────────────────────────────────────┘
```

**Features:**
- Countdown timer
- Friendly tone
- Constructive suggestion

---

#### Error 9: Low Confidence Warning

```
┌──────────────────────────────────────────┐
│  ⚠️ Uncertain Analysis                   │
│                                          │
│  I'm not fully confident about this      │
│  analysis (confidence: 65%).             │
│                                          │
│  Please verify manually or try:          │
│  • Simplifying the code                  │
│  • Adding comments for context           │
│  • Focusing on a specific section        │
│                                          │
│  [Show Results Anyway]  [Retry]          │
└──────────────────────────────────────────┘
```

**Features:**
- Transparency about confidence
- Actionable suggestions
- User choice to proceed or retry

---

#### Error 10: Generic Error (Fallback)

```
┌──────────────────────────────────────────┐
│  ❌ Something went wrong                 │
│                                          │
│  We encountered an unexpected error.     │
│                                          │
│  Error ID: abc123xyz                     │
│  (Share this with support if needed)     │
│                                          │
│  [Try Again]  [Report Issue]             │
└──────────────────────────────────────────┘
```

**Features:**
- Error ID for debugging
- Support contact option
- Apologetic but professional tone

---

### Error State Design Patterns

**Visual Hierarchy:**
1. Icon (emoji or SVG) - Immediate recognition
2. Title (bold, 18px) - What happened
3. Description (regular, 16px) - Why it happened
4. Actions (buttons) - What to do next

**Color Coding:**
- ⚠️ Warning (Amber): User action needed
- ❌ Error (Red): Something failed
- 📡 Info (Blue): Network/connection issues
- ⏰ Neutral (Gray): Session/timeout issues

**Tone Guidelines:**
- Be helpful, not blaming
- Explain what happened clearly
- Provide actionable next steps
- Use friendly language (avoid technical jargon)
- Reassure when possible ("Your work is saved")

**Accessibility:**
- ARIA live regions for dynamic errors
- Screen reader announcements
- Keyboard navigation (Tab to buttons)
- High contrast (4.5:1 minimum)

---

## 6. UX Differentiation from ChatGPT

### Key Differences

| Element | ChatGPT | LogicLens |
|---------|---------|---------------|
| **Entry Point** | "Ask me anything" | "Paste code to analyze" |
| **Primary CTA** | "Send message" | "Check my reasoning" |
| **Interaction** | Conversational | Diagnostic workflow |
| **Output** | Immediate explanation | Questions → Analysis → Explanation |
| **Tone** | Helpful assistant | Senior developer review |
| **Layout** | Chat thread | Structured workspace |

### Specific UI Choices

1. **No Chat Interface**
   - No message bubbles or conversation history
   - No "AI is typing..." indicators
   - Structured panels instead of free-form chat

2. **Forced Workflow**
   - Cannot skip to explanation
   - Must answer questions (or explicitly skip)
   - Linear progression: Input → Questions → Analysis → Results

3. **Code-First Design**
   - Code editor is primary input (not text box)
   - Syntax highlighting always visible
   - Line numbers for precise reference

4. **Diagnostic Language**
   - "Check reasoning" not "Explain code"
   - "Logic gaps" not "mistakes"
   - "Understanding panel" not "AI response"

## 7. Accessibility & Micro-interactions

### Accessibility (WCAG 2.1 AA Compliance)

**Color Contrast:**
- All text meets 4.5:1 ratio minimum
- Interactive elements meet 3:1 ratio
- Never rely on color alone for meaning

**Keyboard Navigation:**
- Tab order follows logical flow
- All interactive elements focusable
- Escape key closes modals
- Enter submits forms

**Screen Reader Support:**
- Semantic HTML (header, main, section, article)
- ARIA labels for icon buttons
- Live regions for dynamic content updates
- Skip links for main content

**Focus States:**
- 2px Indigo outline on all interactive elements
- Visible focus indicator never removed
- Focus trap in modals

### Micro-interactions

**Code Input:**
- Subtle scale animation on paste (1.01x for 200ms)
- Line numbers fade in after paste
- Character count updates in real-time

**Question Navigation:**
- Slide transition between questions (300ms ease-out)
- Progress dots fill with Indigo as completed
- Submit button pulses gently when all answered

**Gap Detection:**
- Staggered reveal of gap cards (100ms delay each)
- Amber warning icon bounces once on appear
- Emerald checkmark draws in (SVG animation)

**Explanation Expand:**
- Smooth height transition (400ms)
- Code snippet fades in with slight upward motion
- Arrow icon rotates 180° when toggled

**Copy Actions:**
- Button text changes to "Copied!" with checkmark
- Reverts after 2 seconds
- Subtle success color flash

**Loading States:**
- Skeleton screens (not spinners) for content areas
- Pulsing animation on placeholders
- Progress indication for multi-step processes

### Enhanced Loading States (Progressive Feedback)

**Philosophy:** Show progress, not just "loading..."

#### Loading State 1: Analyzing Code

```
┌──────────────────────────────────────────┐
│  🔍 Analyzing your code...               │
│                                          │
│  ▓▓▓▓▓▓▓▓░░░░░░░░░░░░  40%              │
│                                          │
│  ✓ Reading code structure                │
│  ⏳ Finding decision points...           │
│  ○ Generating questions                  │
│                                          │
│  Usually takes 3-5 seconds               │
│                                          │
│  [Cancel]                                │
└──────────────────────────────────────────┘
```

**Features:**
- Progress bar (0-100%)
- Step-by-step breakdown
- Time estimate
- Cancel option (after 10 seconds)

---

#### Loading State 2: Generating Questions

```
┌──────────────────────────────────────────┐
│  💭 Generating questions...              │
│                                          │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░  75%             │
│                                          │
│  ✓ Code analyzed                         │
│  ✓ Decision points identified            │
│  ⏳ Creating targeted questions...       │
│                                          │
│  Almost ready...                         │
└──────────────────────────────────────────┘
```

---

#### Loading State 3: Analyzing Your Answers

```
┌──────────────────────────────────────────┐
│  🧠 Analyzing your reasoning...          │
│                                          │
│  ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░  50%              │
│                                          │
│  ✓ Comparing answers to code behavior    │
│  ⏳ Identifying gaps...                  │
│  ○ Generating explanations               │
│                                          │
│  This may take 5-8 seconds               │
└──────────────────────────────────────────┘
```

---

#### Loading State 4: Skeleton Screens

**For Question Cards (Before Load):**
```
┌─────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ ← Pulsing gray
│                                         │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**CSS Animation:**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  background: #E5E7EB;
  border-radius: 4px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

#### Loading State 5: Streaming Response (Future)

**For Real-Time Feedback:**
```
┌──────────────────────────────────────────┐
│  Gap 1: Null Handling                    │
│                                          │
│  Your answer: "Returns empty array"      │
│  Actual: "Throws TypeError"              │
│                                          │
│  Here's what's happening:                │
│  Line 12 calls input.reduce() without... │
│  ⏳ [Generating explanation...]          │
└──────────────────────────────────────────┘
```

**Features:**
- Show partial results as they arrive
- Streaming text (word by word)
- Better perceived performance

---

### Loading State Best Practices

**Do:**
- ✅ Show progress percentage when possible
- ✅ Break down steps ("Analyzing...", "Generating...")
- ✅ Provide time estimates ("Usually takes 3-5 seconds")
- ✅ Allow cancellation after 10 seconds
- ✅ Use skeleton screens for layout stability
- ✅ Animate smoothly (pulsing, not spinning)

**Don't:**
- ❌ Show generic "Loading..." without context
- ❌ Use spinners alone (not informative)
- ❌ Block entire UI (show partial content)
- ❌ Hide time estimates (users want to know)
- ❌ Forget to handle long waits (>10 seconds)

---

### Animation Principles

- Duration: 200-400ms (never longer)
- Easing: ease-out for entrances, ease-in for exits
- Respect prefers-reduced-motion setting
- Functional, not decorative

## 8. Component Library

### Buttons

**Primary Button (Indigo)**
```
Background: #4F46E5
Text: White
Padding: 12px 24px
Border-radius: 8px
Hover: Darken 10%
Active: Scale 0.98
```

**Secondary Button (Gray)**
```
Background: #E5E7EB
Text: #111827
Padding: 12px 24px
Border-radius: 8px
Hover: Darken 5%
```

**Text Button (Cyan)**
```
Background: Transparent
Text: #22D3EE
Padding: 8px 16px
Hover: Underline
```

### Cards

**Standard Card**
```
Background: White
Border: 1px solid #E5E7EB
Border-radius: 12px
Padding: 24px
Shadow: 0 1px 3px rgba(0,0,0,0.1)
```

**Gap Card (Warning)**
```
Background: #FFFBEB (Amber tint)
Border-left: 4px solid #F59E0B
Border-radius: 8px
Padding: 16px
```

**Success Card**
```
Background: #ECFDF5 (Emerald tint)
Border-left: 4px solid #10B981
Border-radius: 8px
Padding: 16px
```

### Inputs

**Text Area**
```
Background: White
Border: 1px solid #D1D5DB
Border-radius: 8px
Padding: 12px
Focus: 2px Indigo border
```

**Radio Button**
```
Size: 20px
Border: 2px solid #D1D5DB
Checked: Indigo fill with white dot
```

## 9. Responsive Design

### Mobile-First Strategy (India-Focused)

**Context:** 70%+ of Indian users are mobile-first, especially in tier-2/3 cities

**Design Philosophy:**
- Design for mobile first, then scale up to desktop
- Optimize for 360px width (most common mobile screen)
- Touch-friendly targets (44px minimum)
- Minimize data usage (critical for 2G/3G users)

### Breakpoint Strategy

**Mobile (<768px) - PRIMARY FOCUS:**
- Single column, vertical scroll
- Sticky header with step indicator
- Collapsible code editor (show first 10 lines)
- One question per screen (swipe to next)
- Bottom action bar (fixed position)
- Large touch targets (44px minimum)

**Tablet (768px-1279px):**
- Two-column layout
- Code + Active panel (Questions or Understanding)
- Tab navigation between panels

**Desktop (1280px+):**
- Three-column layout
- All panels visible simultaneously
- Optimal for workflow

### Mobile-Specific Layout

**Mobile Workspace (<768px):**

```
┌─────────────────────────────────────┐
│  LogicLens  [☰ Menu]  [🌐 हिं/EN]  │ ← Sticky header
├─────────────────────────────────────┤
│  Step 2 of 4: Answering Questions   │ ← Progress bar
├─────────────────────────────────────┤
│                                     │
│  [Collapsible Code Section]        │ ← Tap to expand
│  function sum(arr) {                │
│    return arr.reduce...             │
│  }                                  │
│  [Show full code ↓]                 │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Question 1 of 3                    │
│                                     │
│  What value does result hold        │
│  after line 15 when input is []?    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Your answer...              │   │
│  │                             │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Skip]                             │
│                                     │
│  ← Swipe to navigate →              │
│                                     │
│  ● ○ ○  (Progress dots)             │
│                                     │
└─────────────────────────────────────┘
│  [Next Question →]                  │ ← Fixed bottom bar
└─────────────────────────────────────┘
```

### Mobile-Specific Adjustments

**1. Code Editor (Mobile)**
```
- Default: Collapsed (show first 10 lines)
- Tap to expand: Full screen modal
- Syntax highlighting: Simplified (fewer colors)
- Line numbers: Optional (toggle)
- Font size: 14px (readable on small screens)
- Horizontal scroll: Enabled for long lines
```

**2. Question Navigation (Mobile)**
```
- One question per screen (no pagination)
- Swipe gestures: Left (next), Right (previous)
- Progress dots: Visual indicator (● ○ ○)
- Sticky progress bar at top
- Auto-save on swipe
```

**3. Answer Input (Mobile)**
```
- Large text area (min 120px height)
- Auto-resize as user types
- Voice input button (🎤) for Hindi/English
- Character counter (optional)
- "Skip" button prominent
```

**4. Results Display (Mobile)**
```
- Accordion-style gap cards
- Tap to expand explanation
- One gap visible at a time
- Swipe between gaps
- "Copy" button large and accessible
```

**5. Touch Targets**
```
- Minimum size: 44px × 44px
- Spacing: 8px between targets
- Buttons: Full-width on mobile
- Links: Underlined and large
```

### Low-Bandwidth Mode (India-Critical)

**Trigger:** Automatically detect slow connections (<1 Mbps)

**Detection:**
```typescript
// Detect connection speed
function detectConnectionSpeed(): 'fast' | 'slow' | 'offline' {
  if (!navigator.onLine) return 'offline';
  
  const connection = (navigator as any).connection;
  if (connection) {
    const effectiveType = connection.effectiveType;
    // '2g', '3g', '4g', 'slow-2g'
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return 'slow';
    }
  }
  
  return 'fast';
}

// Enable low-bandwidth mode
useEffect(() => {
  const speed = detectConnectionSpeed();
  if (speed === 'slow') {
    setLowBandwidthMode(true);
    showNotification('Low bandwidth detected. Optimizing experience...');
  }
}, []);
```

**Low-Bandwidth Optimizations:**

**1. Disable Heavy Features**
```
- Monaco Editor → Simple textarea with basic highlighting
- Animations → Disabled (no transitions, fades)
- Images/Icons → Text-only or SVG (inline)
- Web fonts → System fonts only
- Syntax highlighting → Minimal (3 colors max)
```

**2. Compress API Responses**
```typescript
// Backend: Compress responses
app.use(compression({
  level: 9,  // Maximum compression
  threshold: 0,  // Compress everything
}));

// Frontend: Request compressed responses
fetch(url, {
  headers: {
    'Accept-Encoding': 'gzip, deflate, br',
  },
});
```

**3. Reduce Page Weight**
```
Target: <100KB initial load (low-bandwidth mode)

Breakdown:
- HTML: 10KB
- CSS: 20KB (critical only)
- JS: 50KB (minimal bundle)
- Fonts: 0KB (system fonts)
- Images: 10KB (SVG icons only)
- API responses: 10KB (compressed)
```

**4. Progressive Enhancement**
```typescript
// Load features progressively
const LowBandwidthWorkspace = () => {
  return (
    <div className="workspace-minimal">
      {/* Critical features only */}
      <SimpleCodeInput />
      <TextOnlyQuestions />
      <BasicResults />
      
      {/* No Monaco, no animations, no fancy UI */}
    </div>
  );
};

const FullWorkspace = () => {
  return (
    <div className="workspace-full">
      <MonacoEditor />
      <AnimatedQuestions />
      <RichResults />
    </div>
  );
};

// Conditional rendering
const Workspace = () => {
  const { lowBandwidthMode } = useSettings();
  return lowBandwidthMode ? <LowBandwidthWorkspace /> : <FullWorkspace />;
};
```

**5. Offline Capability (Future)**
```
- Cache common code patterns
- Service worker for offline access
- IndexedDB for session storage
- Sync when connection restored
```

**Low-Bandwidth Mode UI Indicator:**
```
┌─────────────────────────────────────┐
│  ⚡ Low Bandwidth Mode Active       │
│  Optimized for slow connections     │
│  [Switch to Full Mode]              │
└─────────────────────────────────────┘
```

### Responsive Component Examples

**Responsive Button:**
```css
.button {
  /* Mobile: Full width */
  width: 100%;
  padding: 16px;
  font-size: 16px;
  
  /* Tablet: Auto width */
  @media (min-width: 768px) {
    width: auto;
    padding: 12px 24px;
    font-size: 14px;
  }
}
```

**Responsive Grid:**
```css
.workspace-grid {
  /* Mobile: Single column */
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  /* Tablet: Two columns */
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  
  /* Desktop: Three columns */
  @media (min-width: 1280px) {
    grid-template-columns: 35% 30% 35%;
  }
}
```

**Responsive Typography:**
```css
.heading {
  /* Mobile: Smaller */
  font-size: 24px;
  line-height: 1.3;
  
  /* Desktop: Larger */
  @media (min-width: 768px) {
    font-size: 32px;
    line-height: 1.2;
  }
}
```

### Mobile Testing Checklist

- [ ] Test on real devices (Android: Samsung, Xiaomi; iOS: iPhone)
- [ ] Test on 360px width (most common)
- [ ] Test on 2G/3G connection (Chrome DevTools throttling)
- [ ] Test touch targets (44px minimum)
- [ ] Test swipe gestures
- [ ] Test keyboard input (Hindi + English)
- [ ] Test voice input (if implemented)
- [ ] Test landscape orientation
- [ ] Test with screen reader (TalkBack, VoiceOver)
- [ ] Test low-bandwidth mode

### Performance Targets (Mobile)

- **First Contentful Paint:** <2 seconds (3G)
- **Time to Interactive:** <5 seconds (3G)
- **Total Page Weight:** <500KB (normal), <100KB (low-bandwidth)
- **API Response Time:** <3 seconds (question generation)
- **Lighthouse Score:** 90+ (Performance, Accessibility)

---

## 10. Design System Summary

**File Structure for Implementation:**
```
/styles
  /tokens
    colors.css
    typography.css
    spacing.css
  /components
    buttons.css
    cards.css
    inputs.css
  /layouts
    workspace.css
    responsive.css
```

**Design Tokens:**
- All colors, spacing, and typography defined as CSS variables
- Consistent naming convention (--color-primary, --space-md)
- Easy theme switching if needed

This design creates a professional, focused tool that feels distinctly different from generic AI chatbots while maintaining excellent usability and accessibility.
