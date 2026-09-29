# Component Registry — Kabadiwala Connect
**Requirement:** §6.9 — Every component must serve defined requirements, answer a clear user question, and justify its existence.

| Component | Serves | User Question Answered | Information Displayed | Justification |
|---|---|---|---|---|
| **Text** | R11 | "What does this say?" | Localized typography in Noto Sans / Noto Sans Devanagari | Enforces strict font scale, script-aware line-height, and contrast tokens across languages. |
| **Button** | R01, R11 | "What is my next action?" | High-contrast touch target (56px) with primary/outline/danger styles | Provides accessible, full-width touch targets for outdoor use with one primary action per screen. |
| **Tile** | R01, R06, R10 | "Which action or material do I choose?" | Pictogram, 1-3 word label, ListenButton | Visual-first interactive selector for low-literacy users. |
| **Card** | R01, R04, R08 | "What are the details of this item or buyer?" | Structured container with 1px outline and surface background | Groups related data without shadows or visual clutter. |
| **Chip** | R01, R15 | "Which filter or grade applies?" | Toggable tag with selected/unselected state | Compact, accessible selection for localities, filters, and subcategories. |
| **StatusChip** | R03, R08 | "What is the current state of my lot?" | Lot status tag (Draft, Valued, Offered, Confirmed, Paid) with semantic color | Visual clarity on transaction lifecycle at a glance. |
| **MoneyText** | R01, R02, R09 | "How much money is this?" | Big bold Indian currency format (e.g. ₹1,23,450) in `money` color | Formats currency consistently with Latin digits across all language modes. |
| **ListenButton** | R06, R11 | "Can you read this aloud to me?" | Speaker icon button triggering audio playback | Essential low-literacy affordance providing spoken audio for every label and instruction. |
| **Stepper** | R01 | "How do I change quantity without typing?" | Large minus / count / plus controls with preset increments | Enables error-free numeric input without opening a virtual keyboard. |
| **SyncDot** | R12 | "Is my phone connected and is my data safe?" | Color-coded status dot (green=synced, amber=waiting, grey=offline) | Unobtrusive, persistent offline/online indicator in the header. |
| **AuthorisedBadge** | R04, R07 | "Is this buyer government authorised and legitimate?" | Shield-check icon, authorization number, validity date | Instills trust and prevents transactions with unauthorized/backyard dismantlers. |
| **EmptyState** | R01, R09 | "Why is this screen empty and what should I do?" | Hand-drawn pictogram, single instructional sentence, primary action | Teaches the user how to populate the screen rather than leaving a blank view. |
| **ScreenShell** | R13 | "Where am I and how do I navigate?" | Safe-area container, optional top bar, bottom action bar | Ensures consistent 8pt layout, keyboard avoidance, and fixed bottom buttons. |
| **TopBar** | R11, R12 | "What app is this and can I change language?" | App title, SyncDot, language toggle, settings button | Consistent header navigation across screens. |
| **StepIndicator** | R01 | "How many steps remain in this flow?" | Visual step count (e.g. "Step 2 of 5") with segmented line | Reduces drop-off by making multi-step forms predictable. |
| **TrendArrow** | R02, R06 | "Are prices going up or down?" | Arrow up/down/flat with green/red/neutral accent | Non-verbal visual indicator of market price momentum. |
| **Sparkline** | R02 | "How has the price moved over the past 4 weeks?" | Lightweight SVG line with 4 data points and weekly labels | Clean trend visualization built with zero heavyweight chart libraries. |
| **Banner** | R05, R10, R12 | "Is there an important warning or offline notice?" | Full-width contextual notice (info/warning/danger) with undo or action | Highlights urgent safety, anomaly, or network conditions. |
| **ErrorBoundary** | R13 | "Did the app crash and is my data safe?" | Shield-check icon, 'Your data is safe' title, retry and home buttons | Protects against unhandled exceptions, ensures zero data loss, and offers quick recovery. |

