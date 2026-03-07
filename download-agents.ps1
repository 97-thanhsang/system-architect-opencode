$agentDir = 'E:\SOURCE\system-architect-opencode\.opencode\agents'
$cmdDir = 'E:\SOURCE\system-architect-opencode\.opencode\commands'
$skillDir = 'E:\SOURCE\system-architect-opencode\.opencode\skills'

function Download($url, $path) {
  try {
    Invoke-WebRequest -Uri $url -OutFile $path -UseBasicParsing -TimeoutSec 15
    Write-Host "  OK: $([System.IO.Path]::GetFileName($path))"
    return $true
  } catch {
    Write-Host "  FAIL: $([System.IO.Path]::GetFileName($path))"
    return $false
  }
}

$ok = 0
$fail = 0

# --- AGENTS ---
Write-Host "Downloading AGENTS..."
$base = 'https://raw.githubusercontent.com/wshobson/agents/main/plugins'
$downloads = @(
  "$agentDir\design-system-architect.md|$base/ui-design/agents/design-system-architect.md",
  "$agentDir\ui-ux-designer.md|$base/ui-design/agents/ui-designer.md",
  "$agentDir\accessibility-expert.md|$base/ui-design/agents/accessibility-expert.md",
  "$agentDir\typescript-pro.md|$base/javascript-typescript/agents/typescript-pro.md",
  "$agentDir\frontend-developer.md|$base/frontend-mobile-development/agents/frontend-developer.md",
  "$agentDir\backend-architect.md|$base/backend-development/agents/backend-architect.md",
  "$agentDir\ai-engineer.md|$base/llm-application-dev/agents/ai-engineer.md",
  "$agentDir\database-architect.md|$base/database-design/agents/database-architect.md",
  "$agentDir\code-reviewer.md|$base/comprehensive-review/agents/code-reviewer.md",
  "$agentDir\security-auditor.md|$base/comprehensive-review/agents/security-auditor.md",
  "$agentDir\test-automator.md|$base/full-stack-orchestration/agents/test-automator.md",
  "$agentDir\conductor-validator.md|$base/conductor/agents/conductor-validator.md"
)

foreach ($item in $downloads) {
  $parts = $item -split '\|'
  if (Download $parts[1] $parts[0]) { $ok++ } else { $fail++ }
}

# --- COMMANDS ---
Write-Host ""
Write-Host "Downloading COMMANDS..."
$cmdDownloads = @(
  "$cmdDir\accessibility-audit.md|$base/ui-design/commands/accessibility-audit.md",
  "$cmdDir\create-component.md|$base/ui-design/commands/create-component.md",
  "$cmdDir\design-review.md|$base/ui-design/commands/design-review.md",
  "$cmdDir\design-system-setup.md|$base/ui-design/commands/design-system-setup.md",
  "$cmdDir\full-review.md|$base/comprehensive-review/commands/full-review.md",
  "$cmdDir\api-design.md|$base/backend-development/commands/api-design.md",
  "$cmdDir\implement-feature.md|$base/full-stack-orchestration/commands/implement-feature.md",
  "$cmdDir\perf-analyze.md|$base/application-performance/commands/perf-analyze.md",
  "$cmdDir\generate-docs.md|$base/code-documentation/commands/generate-docs.md"
)

foreach ($item in $cmdDownloads) {
  $parts = $item -split '\|'
  if (Download $parts[1] $parts[0]) { $ok++ } else { $fail++ }
}

# --- SKILLS ---
Write-Host ""
Write-Host "Downloading SKILLS..."
$skillDownloads = @(
  "design-system-patterns|$base/ui-design/skills/design-system-patterns/SKILL.md",
  "accessibility-compliance|$base/ui-design/skills/accessibility-compliance/SKILL.md",
  "responsive-design|$base/ui-design/skills/responsive-design/SKILL.md",
  "visual-design-foundations|$base/ui-design/skills/visual-design-foundations/SKILL.md",
  "web-component-design|$base/ui-design/skills/web-component-design/SKILL.md",
  "interaction-design|$base/ui-design/skills/interaction-design/SKILL.md"
)

foreach ($item in $skillDownloads) {
  $parts = $item -split '\|'
  $sName = $parts[0]
  $sUrl = $parts[1]
  $sDir = "$skillDir\$sName"
  New-Item -ItemType Directory -Force -Path $sDir | Out-Null
  if (Download $sUrl "$sDir\SKILL.md") { $ok++ } else { $fail++ }
}

Write-Host ""
Write-Host "SUCCESS: $ok   FAILED: $fail"
