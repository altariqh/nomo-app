# Nomo App — Design Documentation

## 1. Project Overview

**Nomo** is a mobile-first travel companion app designed for solo travelers, remote creatives, and small travel groups. It combines itinerary planning, expense tracking, emotional journaling, community reviews, and AI-powered travel reflection into one warm, scrapbook-like experience.

The product positioning is:

> **Aesthetic Solitary Travel Companion**  
> Wander slowly. Trace café lattes, subway trains, vintage bookstore purchases, and mood-linked spending memories alongside your travel route.

The app is generated from Google AI Studio and implemented as a TypeScript React app. It uses a simulated mobile phone layout on desktop, local storage for persistent user/trip data, Gemini-powered AI endpoints, OpenStreetMap/Nominatim-based location search, WebAudio feedback, and native browser notifications.

---

## 2. Product Goals

Nomo should help travelers:

1. **Plan trips with structure**  
   Create a trip, define destination, dates, budget, accommodation, payment methods, and day-by-day itinerary checkpoints.

2. **Track spending with emotional context**  
   Log expenses by category, payer, split members, mood, habits, note, soundtrack, and optional photo cover.

3. **Make travel memories feel personal**  
   Turn itinerary check-ins into reviewed places and travel journal entries.

4. **Support small group travel**  
   Track shared expenses and automatically calculate who owes whom.

5. **Use AI as a soft travel companion**  
   Generate itinerary suggestions, personality insights, trip recaps, and conversational advice.

---

## 3. Target Users

### Primary User

**Solo creative traveler / digital nomad**

- Travels slowly and values atmosphere over speed.
- Works from cafés, bookstores, museums, hotels, or apartments.
- Wants to remember the emotional texture of a trip, not only the transaction history.
- Enjoys curated visual experiences and scrapbook-like interfaces.

### Secondary User

**Small travel group organizer**

- Plans shared routes.
- Tracks group expenses.
- Needs a simple way to split payments and settle debts.
- Wants shared memories and place reviews after visiting spots.

---

## 4. Core User Flow

```text
Sign Up / Sign In
        ↓
Onboarding
        ↓
Create or Select Trip
        ↓
Set Destination + Dates + Budget + Accommodation
        ↓
Add Itinerary Spots / Use AI Suggestions
        ↓
Track Expenses + Emotional Tags
        ↓
Check In to Places + Write Reviews
        ↓
View Ledger, Insights, AI Recap, and Chat
```

---

## 5. Information Architecture

### Authentication

- Sign up
- Sign in
- Remember email
- Demo account entry

### Onboarding

3-step introduction:

1. Expense logs and itinerary scheduling
2. Rating and review system
3. Group utilities and AI recap

### Main App Tabs

| Tab | Purpose |
|---|---|
| **Journal** | Community reviews, personal checked-in reviews, place discovery |
| **Ledger** | Trip planning, budget, itinerary, cards, expenses, settlements |
| **Insights** | AI personality analysis, spending patterns, emotional distribution, trip recap |
| **Chat** | AI travel companion and trip Q&A |

---

## 6. Design Principles

### 6.1 Warm, intentional, and calm

The app should feel like a personal travel notebook rather than a financial dashboard. Budgeting is important, but it should not feel stressful.

### 6.2 Memory-first finance

Expenses are not only numbers. Each transaction can carry mood, habit, soundtrack, photo, and place context.

### 6.3 Mobile-first, desktop-safe

The primary design is a mobile app. On desktop, the UI should be displayed inside a phone-like container to preserve mobile proportions.

### 6.4 AI should feel like a companion, not a command center

AI outputs should be helpful, soft, and reflective. Avoid overly robotic or productivity-heavy language.

### 6.5 Scrapbook over spreadsheet

Use cards, tape-like decorations, soft backgrounds, serif display typography, and small handwritten/editorial details to create a personal archive feeling.

---

## 7. Visual Language

### 7.1 Brand Personality

Nomo should feel:

- Warm
- Slow-travel inspired
- Editorial
- Personal
- Lightly nostalgic
- Cozy but functional
- More “traveler journal” than “banking app”

### 7.2 Color Palette

The current app uses earthy, muted, paper-like tones.

| Token | Value | Usage |
|---|---:|---|
| `--color-ink` | `#3C3836` | Primary text |
| `--color-olive` | `#5A5A40` | Primary action, active state |
| `--color-olive-dark` | `#4A4A34` | Hover / pressed state |
| `--color-paper` | `#FAF8F5` | Input and soft surface background |
| `--color-border` | `#E7E5E4` | Divider / input border |
| `--color-muted` | `#8C857E` | Secondary text |
| `--color-white` | `#FFFFFF` | Cards / elevated surfaces |
| `--color-error` | `#EF4444` | Error and destructive states |

#### Usage Guidance

- Use olive as the main CTA color.
- Use paper tones for forms and surfaces.
- Avoid high-saturation colors except for mood, rating, and alert accents.
- Keep financial data readable and calm; avoid aggressive red/green unless necessary.

---

## 8. Typography

The UI combines editorial serif headings with compact mono labels.

### Recommended Typography Roles

| Role | Style |
|---|---|
| App logo | Lowercase serif, bold, calm |
| Page title | Serif, 24–32px |
| Section title | Serif or bold sans, 16–20px |
| Body text | Sans, 12–14px |
| Metadata / labels | Monospace uppercase, 9–11px |
| Buttons | Bold uppercase, 10–12px |

### Copy Tone

Use warm, travel-oriented language:

- “Traveler Reviews”
- “Checked-In Reviews”
- “Your simple companion”
- “Travel Planner Guide”
- “Let AI craft narrative summaries”

Avoid cold enterprise terms like:

- “Transaction module”
- “Data object”
- “System output”

---

## 9. Layout System

### Mobile Container

- Design for a mobile-first viewport.
- Keep important actions within thumb reach.
- Use stacked cards rather than dense tables.
- Preserve comfortable vertical rhythm between sections.

### Spacing

| Token | Value | Usage |
|---|---:|---|
| `space-1` | 4px | Tight icon/text gap |
| `space-2` | 8px | Small element gap |
| `space-3` | 12px | Form field gap |
| `space-4` | 16px | Card padding |
| `space-5` | 20px | Section padding |
| `space-6` | 24px | Page margin |

### Corner Radius

| Token | Value | Usage |
|---|---:|---|
| `radius-sm` | 8px | Small pills / tags |
| `radius-md` | 12px | Buttons |
| `radius-lg` | 16px | Inputs / small cards |
| `radius-xl` | 24px | Primary cards / modals |

---

## 10. Navigation

### Main Navigation Tabs

The app uses four primary tabs:

1. Journal
2. Ledger
3. Insights
4. Chat

### Behavior

- Active tab should be visually highlighted with olive color or filled surface.
- During feature walkthrough, the app may automatically switch tabs to teach key areas.
- Tab labels should remain short and recognizable.

---

## 11. Components

### 11.1 Buttons

#### Primary Button

Use for main actions:

- Sign Up
- Sign In
- Continue
- Create Trip
- Add Spot
- Save Review

Style:

```css
background: #5A5A40;
color: white;
border-radius: 12px;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.08em;
```

#### Secondary Button

Use for optional actions:

- Skip demo
- Back
- Clear
- Ask AI

Style:

- Light olive tint background
- Olive text
- Rounded rectangle

#### Destructive Button

Use for delete actions only.

- Red text or red tint background
- Never use red as a general emphasis color

---

### 11.2 Cards

Cards are the main content unit.

Common card types:

- Trip card
- Itinerary card
- Expense card
- Review card
- Insight card
- Payment method card

Card style:

- White or paper background
- Soft border
- Rounded corners
- Light shadow
- Optional decorative tape element for scrapbook feel

---

### 11.3 Forms

Forms appear in:

- Sign up / sign in
- Create trip
- Add itinerary spot
- Add expense
- Register card
- Check-in review

Guidelines:

- Use rounded inputs.
- Keep placeholder examples specific and friendly.
- Validate inline with helpful copy.
- Use progressive disclosure for optional fields.

Example error tone:

> Please provide a valid traveler email.

Not:

> Invalid input.

---

### 11.4 Emotional Tags

Expense entries support emotional tags:

- Joyful
- Content
- Indulgent
- Hesitant
- Guilt-free
- Regretful
- Anxious

Guidelines:

- Emotional tags should be visible but not judgmental.
- Avoid shaming language around regret or anxiety.
- Pair emotional states with gentle insights and supportive suggestions.

---

### 11.5 Expense Entry

Each expense should support:

- Title
- Amount
- Category
- Date
- Emotional tag
- Habits
- Note
- Soundtrack
- Photo cover
- Paid by
- Split with

Expense categories:

- Food
- Cafe
- Transit
- Lodging
- Museum/Events
- Entertainment
- Shopping
- Souvenirs
- Misc

---

### 11.6 Itinerary Item

Each itinerary spot should support:

- Title
- Description
- Estimated cost
- Arrival time
- Visit date
- Visited state
- Rating
- Review
- Vibe
- Payment method
- Latitude / longitude
- Estimated time spent

States:

| State | Description |
|---|---|
| Planned | Default state before visit |
| Active Stay | User is currently at this spot |
| Overdue | Planned stay time exceeded |
| Visited | Check-in complete |
| Reviewed | Review posted to journal/community |

---

### 11.7 Community Review Card

Review cards should include:

- Author avatar or initial
- Author vibe
- Date
- Rating
- Place name
- Location
- Review text
- Approximate spend
- Verified visit marker
- Like action
- Ask AI action

---

### 11.8 Payment Method Card

Payment cards should support:

- Bank name
- Card type
- Last four digits
- Balance or limit
- API connection state
- Sync state

Connection states:

- Empty
- Connecting
- Connected
- Failed
- Synced

---

### 11.9 AI Companion Chat

Chat should feel conversational, supportive, and travel-aware.

Default model greeting:

> Hey! I'm Nomo, your soulful companion. Select a workspace, play some city soundtracks, or ask me how to enjoy your travels guilt-free.

Guidelines:

- Use warm travel language.
- Reference the active trip when available.
- Keep answers practical and emotionally aware.
- Avoid sounding like a finance warning system.

---

## 12. Motion and Feedback

### Audio Feedback

The app uses WebAudio chords based on mood changes.

Mood examples:

- Joyful / Guilt-free → brighter major chord
- Anxious / Hesitant → softer minor/suspended chord
- Regretful → quieter minor chord

Guidelines:

- Audio should be optional or easy to mute.
- Never block core interactions if audio is unavailable.
- Use audio as emotional texture, not as required feedback.

### Micro-interactions

Recommended interactions:

- Button press scale: 96–98%
- Card hover lift on desktop
- Smooth tab transitions
- Soft loading shimmer for AI outputs
- Confetti only for positive milestones, not routine actions

---

## 13. AI Features

### AI Itinerary Suggestions

Input context:

- Destination
- Budget
- Currency
- Accommodation type
- Accommodation name
- Coordinates
- Already added spots
- Refresh count

Output should provide:

- Spot title
- Short description
- Estimated cost
- Optional coordinates

### AI Personality Insight

Analyzes travel spending and mood patterns.

Output should include:

- Personality title
- Tagline
- Spending aura
- Vibe score
- Description
- Advice list

### AI Trip Recap

Generates a narrative recap from trip data.

Output should feel like a travel diary, not a financial report.

### AI Chat

The chat assistant should answer questions about:

- Current trip
- Budget
- Itinerary
- Emotional spending
- Local alternatives
- Place recommendations
- Reflection prompts

---

## 14. Accessibility

### Color Contrast

- Ensure olive buttons have sufficient contrast with white text.
- Do not rely on color alone for emotional states or alerts.
- Pair colors with labels, icons, or text.

### Touch Targets

- Minimum tap target: 44 × 44px.
- Avoid placing small delete/edit buttons too close together.

### Forms

- Every field should have a visible label.
- Error messages should be specific and actionable.
- Password visibility toggle should have accessible label text.

### Motion / Audio

- Audio feedback should not be required.
- Notifications should have text fallback inside the app.
- Avoid intense or repeated animation.

---

## 15. Responsive Behavior

### Mobile

- Main experience.
- Bottom navigation remains persistent.
- Forms are single-column.
- Cards stack vertically.

### Tablet / Desktop

- Preserve mobile preview inside a phone container.
- Use desktop background as brand atmosphere.
- Avoid stretching mobile cards across the full desktop width.

---

## 16. Empty States

### No Trips

Message should encourage first action:

> Start your first slow-travel journal by creating a trip.

CTA:

> Create Trip

### No Reviews

Message:

> No spot ratings match your active filter criteria yet. Check in to a visited spot to post your first review.

CTA:

> Go to Travel Planner

### No Expenses

Message:

> Your ledger is still clean. Add your first café, transit, or lodging expense.

CTA:

> Add Expense

---

## 17. Data Model Summary

### User

```ts
User {
  name: string;
  email: string;
  specialty: string;
  seedingMood: string;
  password?: string;
  profilePicture?: string;
}
```

### Trip

```ts
Trip {
  id: string;
  name: string;
  destination: string;
  description: string;
  coverImage: string;
  budget: number;
  currency: string;
  startDate: string;
  endDate: string;
  members: string[];
  expenseEntries: ExpenseEntry[];
  itinerary: ItineraryItem[];
  paymentMethods: PaymentMethod[];
  accommodation?: 'apartment' | 'hotel' | 'airbnb';
  accommodationName?: string;
  latitude?: number;
  longitude?: number;
}
```

### Expense Entry

```ts
ExpenseEntry {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  emotionalTag: EmotionalTag;
  habits: string[];
  soundtrack: { song: string; artist: string } | null;
  note: string;
  photoCover: string | null;
  paidBy: string;
  splitWith: string[];
}
```

---

## 18. Design Tokens

```css
:root {
  --color-ink: #3C3836;
  --color-olive: #5A5A40;
  --color-olive-dark: #4A4A34;
  --color-paper: #FAF8F5;
  --color-border: #E7E5E4;
  --color-muted: #8C857E;
  --color-white: #FFFFFF;
  --color-error: #EF4444;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;

  --shadow-card: 0 8px 24px rgba(60, 56, 54, 0.08);
  --shadow-modal: 0 16px 40px rgba(60, 56, 54, 0.16);
}
```

---

## 19. Implementation Notes

- Store demo/user/trip data in local storage for prototype persistence.
- Keep AI requests behind API endpoints such as `/api/gemini/chat`, `/api/gemini/recap`, `/api/gemini/personality`, and `/api/gemini/suggest-itinerary`.
- Use graceful fallbacks if Gemini, geocoding, WebAudio, or browser notifications fail.
- Keep types centralized in `types.ts`.
- Avoid hard-coding visible strings deep inside business logic when preparing for production.
- Replace local password storage with real authentication before launch.
- Replace simulated card connection with secure payment integration before launch.

---

## 20. Future Improvements

### Product

- Collaborative trip sharing
- Real invite flow for friends
- Export trip recap as PDF or image story
- Offline mode for travel
- Calendar integration
- Multi-currency conversion
- Map-first itinerary view

### Design System

- Formalize reusable components
- Extract tokens into a shared theme file
- Add dark mode
- Add loading, error, and offline states
- Create consistent icon sizing rules
- Document card variants and modal patterns

### AI

- Add explainability for budget suggestions
- Allow users to regenerate with tone controls
- Add “less expensive alternative” action
- Add safety guardrails for travel recommendations

---

## 21. Definition of Done

A feature is ready when:

- It works on mobile viewport first.
- It has empty, loading, success, and error states.
- It uses existing colors, radius, spacing, and typography patterns.
- It does not introduce a new visual style without documentation.
- It has accessible labels and readable contrast.
- It preserves the calm scrapbook travel feeling of Nomo.
