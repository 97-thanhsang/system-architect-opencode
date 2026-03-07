---
description: "Master Orchestrator - Intelligent workflow coordinator that analyzes requests and dynamically selects optimal agents/commands/skills from both project and global config"
argument-hint: "<request-description> [--dry-run] [--verbose]"
---

# `/dev` - Master Orchestrator

> **Purpose**: Intelligent workflow orchestrator that analyzes user requirements and dynamically coordinates agents, commands, and skills from both project and global OpenCode configuration.

## Overview

`/dev` acts as a **Master Orchestrator** that:
1. **Scans** all available resources (agents/commands/skills) from:
   - Project: `E:\SOURCE\system-architect-opencode\.opencode\`
   - Global: `C:\Users\My PC\.config\opencode\`
2. **Analyzes** user request using semantic pattern matching
3. **Selects** optimal combination of resources for the task
4. **Generates** orchestration prompt coordinating all selected resources
5. **Executes** by invoking appropriate tools (task/skill/commands)

## Usage

```bash
# Basic usage - automatically selects optimal resources
/dev "Implement refresh token authentication with JWT"

# Dry run - show selected resources without executing
/dev "Create Angular dashboard component" --dry-run

# Verbose - show detailed matching logic
/dev "Setup Redis queue system" --verbose
```

## Resource Discovery

### 1. Project-Level Resources (`.opencode/`)

```
Project: E:\SOURCE\system-architect-opencode
├── agents/           # 10 agents
│   ├── ui-visual-validator.md
│   ├── ui-ux-designer.md
│   ├── accessibility-expert.md
│   ├── design-system-architect.md
│   ├── monorepo-architect.md
│   ├── security-auditor.md
│   ├── test-automator.md
│   ├── typescript-pro.md
│   ├── code-reviewer.md
│   └── openwork.md
├── commands/         # 20 commands
│   ├── dev.md (this file)
│   ├── generate-service.md
│   ├── generate-component.md
│   ├── angular-init.md
│   ├── security-hardening.md
│   ├── performance-optimization.md
│   ├── test-generate.md
│   ├── tdd-cycle.md
│   ├── full-review.md
│   └── ... (20 total)
└── skills/           # 25 skills
    ├── angular-signals/
    ├── angular-forms/
    ├── angular-routing/
    ├── angular-http/
    ├── typescript-advanced-types/
    └── ... (25 total)
```

### 2. Global Resources (`~/.config/opencode/`)

```
Global: C:\Users\My PC\.config\opencode
├── agents/           # 11 agents
│   ├── analyze.md
│   ├── code.md
│   ├── solution.md
│   ├── review.md
│   ├── ems-finance.md
│   ├── integration.md
│   ├── jira.md
│   ├── codebase.md
│   ├── system-architect.md
│   ├── task-manager.md
│   └── test.md
├── commands/         # 8 command directories
│   ├── codebase/
│   ├── ctx7/
│   ├── ems-finance/
│   ├── mcp-jira-server/
│   ├── system/
│   ├── tasks/
│   └── workflows/
└── skills/           # 34 skills
    ├── receival/
    ├── execution/
    ├── design-solution/
    ├── reviewing-code/
    ├── ems-finance-module-generator/
    └── ... (34 total)
```

## Pattern Matching Engine

### Semantic Analysis

```typescript
interface RequestAnalysis {
  domain: 'frontend' | 'backend' | 'security' | 'database' | 'testing' | 'devops';
  technology: string[];        // ['angular', 'typescript', 'nestjs']
  taskType: 'create' | 'modify' | 'review' | 'analyze' | 'fix' | 'optimize';
  complexity: 'simple' | 'medium' | 'complex';
  scope: 'component' | 'service' | 'module' | 'system' | 'architecture';
}
```

### Resource Matching Matrix

| Request Pattern | Agents | Commands | Skills |
|----------------|--------|----------|--------|
| **"Angular component"** | ui-ux-designer, typescript-pro | /generate-component | angular-signals, angular-forms, web-component-design |
| **"API service"** | typescript-pro | /generate-service | angular-http, typescript-advanced-types |
| **"Security/JWT/auth"** | security-auditor | /security-hardening, /security-sast | mcp-builder (for auth patterns) |
| **"Test/unit test"** | test-automator | /test-generate, /tdd-cycle | angular-testing, test-generation |
| **"Code review"** | code-reviewer | /full-review | reviewing-code, code-review-excellence |
| **"Database/Redis"** | monorepo-architect | - | - |
| **"Analyze task"** | analyze | - | receival |
| **"Design solution"** | solution | - | design-solution |
| **"Implement feature"** | code | - | execution |
| **"Review code"** | review | - | reviewing-code |

## Execution Workflow

### Step 1: Parse Request

```typescript
// Parse user input
const rawInput = $ARGUMENTS;
const flags = {
  dryRun: rawInput.includes('--dry-run'),
  verbose: rawInput.includes('--verbose')
};
const userRequest = rawInput.replace(/--(dry-run|verbose)/g, '').trim();
```

### Step 2: Discover Resources

```typescript
// Scan both project and global resources
const projectResources = scanProjectResources();
const globalResources = scanGlobalResources();
const allResources = mergeResources(projectResources, globalResources);
```

### Step 3: Semantic Matching

```typescript
// Analyze request and match with resources
const analysis = analyzeRequest(userRequest);
const matchedResources = matchResources(analysis, allResources);

// Priority: Project resources > Global resources
// When both have same name, prefer project version
```

### Step 4: Generate Orchestration Plan

```typescript
const orchestrationPlan = {
  request: userRequest,
  analysis: analysis,
  phases: [
    {
      name: 'Phase 1: Analysis/Setup',
      resources: matchedResources.filter(r => r.phase === 1),
      executionOrder: determineExecutionOrder(phase1Resources)
    },
    {
      name: 'Phase 2: Implementation',
      resources: matchedResources.filter(r => r.phase === 2),
      executionOrder: determineExecutionOrder(phase2Resources)
    },
    {
      name: 'Phase 3: Review/Validation',
      resources: matchedResources.filter(r => r.phase === 3),
      executionOrder: determineExecutionOrder(phase3Resources)
    }
  ],
  estimatedTime: calculateEstimatedTime(matchedResources),
  totalResources: matchedResources.length
};
```

### Step 5: Present Plan (if not dry-run)

```markdown
# 🎯 Orchestration Plan

## Request
"${userRequest}"

## Analysis
- **Domain**: ${analysis.domain}
- **Technology**: ${analysis.technology.join(', ')}
- **Task Type**: ${analysis.taskType}
- **Complexity**: ${analysis.complexity}
- **Scope**: ${analysis.scope}

## Selected Resources (${totalResources} total)

### Phase 1: ${phase1.name}
${phase1.resources.map(r => `- **${r.type}**: ${r.name} (${r.source})
  - Purpose: ${r.purpose}`).join('\n')}

### Phase 2: ${phase2.name}
${phase2.resources.map(r => `- **${r.type}**: ${r.name} (${r.source})
  - Purpose: ${r.purpose}`).join('\n')}

### Phase 3: ${phase3.name}
${phase3.resources.map(r => `- **${r.type}**: ${r.name} (${r.source})
  - Purpose: ${r.purpose}`).join('\n')}

## Execution Strategy
${orchestrationPlan.phases.map((phase, i) => `
### ${phase.name}
${phase.executionOrder.map((resource, j) => `${j + 1}. Invoke ${resource.type}: ${resource.name}
   - Action: ${resource.action}
   - Expected Output: ${resource.expectedOutput}`).join('\n')}
`).join('\n')}

## ⏱️ Estimation
- **Total Time**: ${estimatedTime}
- **Phases**: ${phases.length}
- **Agents**: ${agentCount}
- **Commands**: ${commandCount}
- **Skills**: ${skillCount}

---
**Execute this plan?** (Y/N/Modify)
```

### Step 6: Execute Plan

```typescript
async function executePlan(plan) {
  const results = [];
  
  for (const phase of plan.phases) {
    console.log(`\n🚀 Executing: ${phase.name}`);
    
    for (const resource of phase.executionOrder) {
      try {
        let result;
        
        switch (resource.type) {
          case 'agent':
            // Use task() to invoke agent
            result = await task({
              description: `${phase.name}: ${resource.name}`,
              prompt: buildAgentPrompt(resource, plan.request, results),
              subagent_type: extractAgentType(resource.name)
            });
            break;
            
          case 'command':
            // Some commands may use skill() or direct execution
            result = await executeCommand(resource, plan.request, results);
            break;
            
          case 'skill':
            // Use skill() to load and execute
            result = await skill({ name: resource.name });
            break;
        }
        
        results.push({
          phase: phase.name,
          resource: resource.name,
          type: resource.type,
          result: result,
          status: 'success'
        });
        
        console.log(`✅ Completed: ${resource.name}`);
        
      } catch (error) {
        results.push({
          phase: phase.name,
          resource: resource.name,
          type: resource.type,
          error: error.message,
          status: 'failed'
        });
        
        console.error(`❌ Failed: ${resource.name} - ${error.message}`);
        
        // Ask user whether to continue or abort
        const shouldContinue = await askUserContinue();
        if (!shouldContinue) break;
      }
    }
  }
  
  return results;
}
```

## Prompt Templates

### Agent Prompt Builder

```typescript
function buildAgentPrompt(resource, request, previousResults) {
  const context = previousResults.length > 0 
    ? `\n## Previous Results\n${previousResults.map(r => `- ${r.resource}: ${r.status}`).join('\n')}`
    : '';
  
  return `
# Task: ${request}

## Your Role
You are the **${resource.name}** agent.
${resource.description}

## Context
This task is part of an orchestrated workflow. ${context}

## Specific Instructions
${resource.specificInstructions || 'Execute your specialty to fulfill the request.'}

## Output
${resource.expectedOutput || 'Provide your expert output based on your capabilities.'}

## Request Details
"${request}"

---
Proceed with your task using your specialized capabilities.
`;
}
```

### Command Execution

```typescript
async function executeCommand(resource, request, previousResults) {
  // Commands can be:
  // 1. Skill-based (use skill() tool)
  // 2. Agent-based (use task() tool)
  // 3. Direct execution (custom logic)
  
  const commandConfig = loadCommandConfig(resource.path);
  
  if (commandConfig.type === 'skill') {
    return await skill({ name: commandConfig.skillName });
  } else if (commandConfig.type === 'agent') {
    return await task({
      description: commandConfig.description,
      prompt: commandConfig.buildPrompt(request, previousResults),
      subagent_type: commandConfig.agentType
    });
  } else {
    // Direct execution logic defined in command file
    return await commandConfig.execute(request, previousResults);
  }
}
```

## Examples

### Example 1: Refresh Token Implementation

```bash
/dev "Implement refresh token authentication with access token 15min, refresh token 7 days, token rotation, CSRF protection"
```

**Analysis:**
- Domain: security
- Technology: [jwt, authentication, security]
- Task Type: create
- Complexity: complex
- Scope: system

**Selected Resources:**
- **Phase 1 (Architecture)**: security-auditor agent, /security-hardening command
- **Phase 2 (Implementation)**: typescript-pro agent, /generate-service command, typescript-advanced-types skill
- **Phase 3 (Validation)**: code-reviewer agent, /full-review command, reviewing-code skill

**Execution:**
1. security-auditor: Review security best practices
2. /security-hardening: Apply security configurations
3. typescript-pro: Design token architecture
4. /generate-service: Generate NestJS service
5. typescript-advanced-types: Ensure type safety
6. code-reviewer: Review implementation
7. /full-review: Comprehensive review
8. reviewing-code skill: Final validation

### Example 2: Angular Component

```bash
/dev "Create a user profile dashboard with tabs, forms, and real-time updates using Angular 17 signals"
```

**Analysis:**
- Domain: frontend
- Technology: [angular, typescript, signals]
- Task Type: create
- Complexity: medium
- Scope: component

**Selected Resources:**
- **Phase 1**: ui-ux-designer agent, angular-signals skill
- **Phase 2**: /generate-component command, typescript-pro agent, angular-forms skill
- **Phase 3**: ui-visual-validator agent, test-automator agent

### Example 3: API Integration

```bash
/dev "Design and implement REST API for task queue management with Redis and BullMQ"
```

**Analysis:**
- Domain: backend
- Technology: [nestjs, redis, queue, api]
- Task Type: create
- Complexity: complex
- Scope: architecture

**Selected Resources:**
- **Phase 1**: monorepo-architect agent (project structure)
- **Phase 2**: typescript-pro agent, /generate-service command (x3 services)
- **Phase 3**: code-reviewer agent, test-automator agent

## Resource Priority Rules

### 1. Source Priority
```
Project resources > Global resources
```
- When both project and global have same resource name, prefer project version
- Project resources override global with same functionality

### 2. Type Priority
```
For execution order:
1. Skills (setup/configuration)
2. Agents (analysis/design)
3. Commands (generation/execution)
4. Agents (review/validation)
```

### 3. Phase Assignment
```
Phase 1 (Analysis): analyze, receival, design-solution, security-auditor
Phase 2 (Implementation): code, execution, generate-*, typescript-pro, ui-ux-designer
Phase 3 (Review): review, reviewing-code, code-reviewer, test-automator, accessibility-expert
```

## Error Handling

### Resource Not Found
```typescript
if (matchedResources.length === 0) {
  console.warn(`⚠️ No matching resources found for: "${request}"`);
  console.log(`Available domains: frontend, backend, security, database, testing`);
  console.log(`Try rephrasing your request or use more specific keywords.`);
  return;
}
```

### Execution Failure
```typescript
try {
  await executeResource(resource);
} catch (error) {
  console.error(`❌ ${resource.name} failed: ${error.message}`);
  
  const options = await askUser(`
What would you like to do?
1. Retry ${resource.name}
2. Skip to next resource
3. Modify and retry
4. Abort entire workflow
  `);
  
  switch (options) {
    case '1': await executeResource(resource); break;
    case '2': continue;
    case '3': /* modify and retry */ break;
    case '4': return;
  }
}
```

## Integration with OpenCode System

### Loading Order
1. Parse command arguments
2. Discover resources from:
   - `E:\SOURCE\system-architect-opencode\.opencode\` (project)
   - `C:\Users\My PC\.config\opencode\` (global)
3. Merge and deduplicate (project wins)
4. Analyze request and match resources
5. Generate orchestration plan
6. Present to user (unless --dry-run)
7. Execute upon confirmation
8. Report results

### State Management
- Track execution results across phases
- Pass context between resources
- Maintain conversation history
- Support for retry and modification

---

**Version**: 2.0 (Master Orchestrator)
**Author**: System Architect Agent
**Last Updated**: March 7, 2026