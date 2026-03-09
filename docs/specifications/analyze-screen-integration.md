# 📋 Specification: Analyze Screen Integration

> **Project**: System Architect OpenCode  
> **Version**: 1.0  
> **Date**: March 9, 2026  
> **Status**: Draft  
> **Author**: System Architect Agent

---

## 1. Overview

### 1.1 Purpose

This specification defines the integration of an **Analyze Screen** into the OpenCode root-opencode system. The Analyze Screen provides AI-powered task analysis, similar to the existing implementation in `system-architect-opencode`.

### 1.2 Current State

**Existing Implementation** (`system-architect-opencode`):
- Angular 17 standalone components
- 3-board layout: Input → Progress → Output
- Uses OpenCode SDK for AI session management

**Target** (`root-opencode`):
- SolidJS + Tailwind CSS + Kobalte
- Integrated into Session Side Panel
- Follows root-opencode patterns

---

## 2. Architecture

### 2.1 Tech Stack

| Layer | Technology | Notes |
| ------|------------|-------|
| **Framework** | SolidJS | Root-opencode uses Solid, NOT Angular |
| **Styling** | Tailwind CSS | Use root-opencode design tokens |
| **UI Components** | @opencode-ai/ui | Use existing UI library |
| **State** | SolidJS Signals/Stores | Follow root-opencode patterns |
| **API** | OpenCode SDK | Same as review-tab.tsx |

### 2.2 Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                      ROOT-OPENCODE UI                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────────────────────┐   │
│  │ Session Side    │───▶│ Analyze Panel (NEW)             │   │
│  │ Panel          │    │                                  │   │
│  │                │    │  ┌─────────┐ ┌─────────┐        │   │
│  │ - Review Tab   │    │  │ Board 1 │ │ Board 2 │        │   │
│  │ - Context Tab  │    │  │ (Input) │ │(Progress)│        │   │
│  │ - File Tabs    │    │  └─────────┘ └─────────┘        │   │
│  │                │    │  ┌─────────┐                    │   │
│  │ - ANALYZE TAB  │    │  │ Board 3 │                    │   │
│  │   (NEW)       │    │  │ (Output)│                    │   │
│  │                │    │  └─────────┘                    │   │
│  └─────────────────┘    └──────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Component Structure

```
packages/app/src/pages/session/
├── session-side-panel.tsx    # Add Analyze Tab
├── analyze-panel.tsx         # NEW: Main analyze panel
├── analyze/
│   ├── board1-input/         # Task input component
│   │   ├── task-input.tsx
│   │   └── task-input.service.ts
│   ├── board2-progress/      # Progress monitor
│   │   ├── progress-monitor.tsx
│   │   └── analyze.service.ts
│   └── board3-output/        # Output viewer
│       ├── output-viewer.tsx
│       └── analysis-result.ts
```

---

## 3. UI Components

### 3.1 Analyze Panel (NEW)

**File**: `session/analyze-panel.tsx`

```typescript
import { type JSX, Show } from "solid-js"
import { Tabs } from "@opencode-ai/ui/tabs"
import { useLayout } from "@/context/layout"

export interface AnalyzePanelProps {
  // Input props
  onAnalyze?: (input: string) => void
  
  // Progress props
  progress?: () => number
  currentPhase?: () => string
  events?: () => AnalyzeEvent[]
  
  // Output props
  result?: () => AnalysisResult | null
  onExport?: (result: AnalysisResult) => void
}

export function AnalyzePanel(props: AnalyzePanelProps): JSX.Element {
  const layout = useLayout()
  
  return (
    <Tabs>
      <Tabs.List>
        <Tabs.Trigger value="input">Input</Tabs.Trigger>
        <Tabs.Trigger value="progress">Progress</Tabs.Trigger>
        <Tabs.Trigger value="output">Output</Tabs.Trigger>
      </Tabs.List>
      
      <Tabs.Content value="input">
        <Board1Input onSubmit={props.onAnalyze} />
      </Tabs.Content>
      
      <Tabs.Content value="progress">
        <Board2Progress 
          progress={props.progress}
          currentPhase={props.currentPhase}
          events={props.events}
        />
      </Tabs.Content>
      
      <Tabs.Content value="output">
        <Board3Output 
          result={props.result}
          onExport={props.onExport}
        />
      </Tabs.Content>
    </Tabs>
  )
}
```

### 3.2 Board 1: Task Input

**Purpose**: User enters task requirements

**Features**:
- Text area for task description
- Project path selector
- Save path configuration
- Submit button with validation

**Pattern** (from root-opencode):
```typescript
// Use existing @opencode-ai/ui components
import { TextArea } from "@opencode-ai/ui/textarea"
import { Button } from "@opencode-ai/ui/button"
import { FileSelect } from "@/components/dialog-select-file"
```

### 3.3 Board 2: Progress Monitor

**Purpose**: Display real-time AI analysis progress

**Features**:
- Progress bar (0-100%)
- Current phase indicator
- Event stream display (SSE)
- Cancel button

**SSE Events** (from existing implementation):
```typescript
type AnalyzeEvent = 
  | { type: 'message.part.updated'; part: Part }
  | { type: 'permission.asked'; request: PermissionRequest }
  | { type: 'question.asked'; question: Question }
  | { type: 'session.status'; status: 'busy' | 'idle' }
```

### 3.4 Board 3: Output Viewer

**Purpose**: Display analysis results

**Features**:
- Markdown rendering
- Copy to clipboard
- Export to file
- Link to related tasks

---

## 4. Integration

### 4.1 Add Tab to Session Side Panel

**File**: `session-side-panel.tsx`

```typescript
// Add to imports
import { AnalyzePanel } from "./analyze-panel"

// Add to Tabs.List
<Show when={analyzeTabEnabled()}>
  <Tabs.Trigger value="analyze">
    <div class="flex items-center gap-1.5">
      <div>{language.t("session.tab.analyze")}</div>
    </div>
  </Tabs.Trigger>
</Show>

// Add to Tabs.Content
<Show when={analyzeTabEnabled()}>
  <Tabs.Content value="analyze" class="flex flex-col h-full overflow-hidden">
    <AnalyzePanel 
      onAnalyze={handleAnalyze}
      progress={analyzeProgress}
      result={analyzeResult}
    />
  </Tabs.Content>
</Show>
```

### 4.2 State Management

**File**: `context/analyze.ts` (NEW)

```typescript
import { createSignal, createRoot } from "solid-js"
import { createStore } from "solid-js/store"

export function createAnalyzeStore() {
  const [progress, setProgress] = createSignal(0)
  const [currentPhase, setCurrentPhase] = createSignal("")
  const [events, setEvents] = createSignal<AnalyzeEvent[]>([])
  const [result, setResult] = createSignal<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = createSignal(false)
  
  return {
    progress,
    setProgress,
    currentPhase,
    setCurrentPhase,
    events,
    setEvents,
    result,
    setResult,
    isAnalyzing,
    setIsAnalyzing,
  }
}

export const analyzeStore = createRoot(createAnalyzeStore)
```

### 4.3 SDK Integration

**File**: `session/analyze-panel.tsx`

```typescript
import { useSDK } from "@/context/sdk"

function AnalyzeService() {
  const sdk = useSDK()
  
  const startAnalysis = async (input: AnalyzeInput) => {
    // Create session
    const session = await sdk.client.session.create({
      messages: [
        {
          role: "user",
          content: input.taskDescription
        }
      ],
      projectPath: input.projectPath,
      agentId: "analyze", // or "build"
    })
    
    // Connect SSE
    const eventSource = new EventSource(
      `${sdk.config.apiUrl}/session/${session.id}/events`
    )
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      // Handle events
    }
    
    return { session, eventSource }
  }
  
  return { startAnalysis }
}
```

---

## 5. Data Models

### 5.1 Analyze Input

```typescript
interface AnalyzeInput {
  taskDescription: string
  projectPath: string
  savePath?: string
  options?: {
    includeRisks?: boolean
    includeEstimation?: boolean
    includeTechSpec?: boolean
  }
}
```

### 5.2 Analysis Result

```typescript
interface AnalysisResult {
  id: string
  summary: string
  classification: {
    complexity: "simple" | "medium" | "complex"
    risk: "low" | "medium" | "high"
    domain: string[]
  }
  businessAnalysis: {
    requirements: string[]
    acceptanceCriteria: string[]
    dependencies: string[]
  }
  techSpec: {
    affectedFiles: string[]
    newFiles: string[]
    apiChanges: string[]
  }
  estimation: {
    effort: string
    timeline: string
  }
  risks: Risk[]
  actionableItems: ActionItem[]
}
```

---

## 6. Design Tokens

### 6.1 Tailwind Classes (from root-opencode)

Use existing design tokens:

```typescript
// Colors
bg-background-base      // Main background
bg-background-stronger  // Elevated surfaces
text-text-weak         // Muted text
border-border-weaker-base // Subtle borders

// Spacing
p-3, p-4, p-6          // Padding
gap-1.5, gap-2        // Gaps
m-2, m-4               // Margins

// Typography
text-12-regular        // Small text
text-14-regular        // Body text
text-16-regular        // Headings

// Components
Button, TextArea, Card // @opencode-ai/ui
```

---

## 7. Implementation Phases

### Phase 1: Basic Structure
- [ ] Create `analyze-panel.tsx` 
- [ ] Add Analyze tab to session-side-panel
- [ ] Set up analyze store

### Phase 2: Board 1 (Input)
- [ ] Create task input component
- [ ] Integrate file selector
- [ ] Add validation

### Phase 3: Board 2 (Progress)
- [ ] Implement SSE connection
- [ ] Create progress display
- [ ] Handle events

### Phase 4: Board 3 (Output)
- [ ] Create output viewer
- [ ] Add markdown rendering
- [ ] Implement export

### Phase 5: Polish
- [ ] Add loading states
- [ ] Error handling
- [ ] UX improvements

---

## 8. References

| File | Description |
|------|-------------|
| `review-tab.tsx` | Pattern for tab content |
| `session-side-panel.tsx` | Panel integration |
| `layout.tsx` | State management |
| `@opencode-ai/ui` | UI component library |
| `system-architect-opencode` | Existing implementation reference |

---

## 9. Open Questions

1. **Agent Selection**: Should users select which agent to use (build/analyze/plan)?
2. **Persistence**: Should analysis results be saved to file system?
3. **Multi-session**: Should multiple analysis run in parallel?
4. **History**: Should we show previous analyses?

---

**Next Steps**:
1. Review this specification
2. Confirm architecture decisions
3. Start Phase 1 implementation
