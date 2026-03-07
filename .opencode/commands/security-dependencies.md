---
description: "Scan dependencies for vulnerabilities, generate SBOM, and provide remediation strategies"
argument-hint: "<project path> [--ecosystem npm|pip|go|cargo]"
---

# Dependency Vulnerability Scanning

You are a security expert specializing in dependency vulnerability analysis, SBOM generation, and supply chain security. Scan project dependencies across multiple ecosystems to identify vulnerabilities, assess risks, and provide automated remediation strategies.

## Context

The user needs comprehensive dependency security analysis to identify vulnerable packages, outdated dependencies, and license compliance issues. Focus on multi-ecosystem support, vulnerability database integration, SBOM generation, and automated remediation using modern 2024/2025 tools.

## Requirements

$ARGUMENTS

## Instructions

### 1. Multi-Ecosystem Dependency Scanner

```python
import subprocess
import json
import requests
from pathlib import Path
from typing import Dict, List, Any
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Vulnerability:
    package: str
    version: str
    vulnerability_id: str
    severity: str
    cve: List[str]
    cvss_score: float
    fixed_versions: List[str]
    source: str

class DependencyScanner:
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.ecosystem_scanners = {
            'npm': self.scan_npm,
            'pip': self.scan_python,
            'go': self.scan_go,
            'cargo': self.scan_rust
        }

    def detect_ecosystems(self) -> List[str]:
        ecosystem_files = {
            'npm': ['package.json', 'package-lock.json'],
            'pip': ['requirements.txt', 'pyproject.toml'],
            'go': ['go.mod'],
            'cargo': ['Cargo.toml']
        }

        detected = []
        for ecosystem, patterns in ecosystem_files.items():
            if any(list(self.project_path.glob(f"**/{p}")) for p in patterns):
                detected.append(ecosystem)
        return detected

    def scan_all_dependencies(self) -> Dict[str, Any]:
        ecosystems = self.detect_ecosystems()
        results = {
            'timestamp': datetime.now().isoformat(),
            'ecosystems': {},
            'vulnerabilities': [],
            'summary': {
                'total_vulnerabilities': 0,
                'critical': 0,
                'high': 0,
                'medium': 0,
                'low': 0
            }
        }

        for ecosystem in ecosystems:
            scanner = self.ecosystem_scanners.get(ecosystem)
            if scanner:
                ecosystem_results = scanner()
                results['ecosystems'][ecosystem] = ecosystem_results
                results['vulnerabilities'].extend(ecosystem_results.get('vulnerabilities', []))

        self._update_summary(results)
        results['remediation_plan'] = self.generate_remediation_plan(results['vulnerabilities'])
        results['sbom'] = self.generate_sbom(results['ecosystems'])

        return results

    def scan_npm(self) -> Dict[str, Any]:
        results = {
            'ecosystem': 'npm',
            'vulnerabilities': []
        }

        try:
            npm_result = subprocess.run(
                ['npm', 'audit', '--json'],
                cwd=self.project_path,
                capture_output=True,
                text=True,
                timeout=120
            )

            if npm_result.stdout:
                audit_data = json.loads(npm_result.stdout)
                for vuln_id, vuln in audit_data.get('vulnerabilities', {}).items():
                    results['vulnerabilities'].append({
                        'package': vuln.get('name', vuln_id),
                        'version': vuln.get('range', ''),
                        'vulnerability_id': vuln_id,
                        'severity': vuln.get('severity', 'UNKNOWN').upper(),
                        'cve': vuln.get('cves', []),
                        'fixed_in': vuln.get('fixAvailable', {}).get('version', 'N/A'),
                        'source': 'npm_audit'
                    })
        except Exception as e:
            results['error'] = str(e)

        return results

    def scan_python(self) -> Dict[str, Any]:
        results = {
            'ecosystem': 'python',
            'vulnerabilities': []
        }

        try:
            safety_result = subprocess.run(
                ['safety', 'check', '--json'],
                cwd=self.project_path,
                capture_output=True,
                text=True,
                timeout=120
            )

            if safety_result.stdout:
                safety_data = json.loads(safety_result.stdout)
                for vuln in safety_data:
                    results['vulnerabilities'].append({
                        'package': vuln.get('package_name', ''),
                        'version': vuln.get('analyzed_version', ''),
                        'vulnerability_id': vuln.get('vulnerability_id', ''),
                        'severity': 'HIGH',
                        'fixed_in': vuln.get('fixed_version', ''),
                        'source': 'safety'
                    })
        except Exception as e:
            results['error'] = str(e)

        return results

    def _update_summary(self, results: Dict[str, Any]):
        vulnerabilities = results['vulnerabilities']
        results['summary']['total_vulnerabilities'] = len(vulnerabilities)

        for vuln in vulnerabilities:
            severity = vuln.get('severity', '').upper()
            if severity == 'CRITICAL':
                results['summary']['critical'] += 1
            elif severity == 'HIGH':
                results['summary']['high'] += 1
            elif severity == 'MEDIUM':
                results['summary']['medium'] += 1
            elif severity == 'LOW':
                results['summary']['low'] += 1

    def generate_remediation_plan(self, vulnerabilities: List[Dict]) -> Dict[str, Any]:
        plan = {
            'immediate_actions': [],
            'short_term': [],
            'automation_scripts': {}
        }

        critical_high = [v for v in vulnerabilities if v.get('severity', '').upper() in ['CRITICAL', 'HIGH']]

        for vuln in critical_high[:20]:
            plan['immediate_actions'].append({
                'package': vuln.get('package', ''),
                'current_version': vuln.get('version', ''),
                'fixed_version': vuln.get('fixed_in', 'latest'),
                'severity': vuln.get('severity', ''),
                'priority': 1
            })

        plan['automation_scripts'] = {
            'npm_fix': 'npm audit fix && npm update',
            'pip_fix': 'pip-audit --fix && safety check',
            'go_fix': 'go get -u ./... && go mod tidy',
            'cargo_fix': 'cargo update && cargo audit'
        }

        return plan

    def generate_sbom(self, ecosystems: Dict[str, Any]) -> Dict[str, Any]:
        sbom = {
            'bomFormat': 'CycloneDX',
            'specVersion': '1.5',
            'version': 1,
            'metadata': {
                'timestamp': datetime.now().isoformat()
            },
            'components': []
        }

        for ecosystem_name, ecosystem_data in ecosystems.items():
            for vuln in ecosystem_data.get('vulnerabilities', []):
                sbom['components'].append({
                    'type': 'library',
                    'name': vuln.get('package', ''),
                    'version': vuln.get('version', ''),
                    'purl': f"pkg:{ecosystem_name}/{vuln.get('package', '')}@{vuln.get('version', '')}"
                })

        return sbom
```

### 2. CI/CD Integration

```yaml
name: Dependency Security Scan

on:
  push:
    branches: [main]
  schedule:
    - cron: "0 2 * * *"

jobs:
  scan-dependencies:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        ecosystem: [npm, python, go]

    steps:
      - uses: actions/checkout@v4

      - name: NPM Audit
        if: matrix.ecosystem == 'npm'
        run: |
          npm ci
          npm audit --json > npm-audit.json || true
          npm audit --audit-level=moderate

      - name: Python Safety
        if: matrix.ecosystem == 'python'
        run: |
          pip install safety pip-audit
          safety check --json --output safety.json || true
          pip-audit --format=json --output=pip-audit.json || true

      - name: Go Vulnerability Check
        if: matrix.ecosystem == 'go'
        run: |
          go install golang.org/x/vuln/cmd/govulncheck@latest
          govulncheck -json ./... > govulncheck.json || true

      - name: Upload Results
        uses: actions/upload-artifact@v4
        with:
          name: scan-${{ matrix.ecosystem }}
          path: "*.json"
```

### 3. Automated Updates

```bash
#!/bin/bash
# automated-dependency-update.sh

set -euo pipefail

ECOSYSTEM="$1"
UPDATE_TYPE="${2:-patch}"

update_npm() {
    npm audit --audit-level=moderate || true

    if [ "$UPDATE_TYPE" = "patch" ]; then
        npm update --save
    elif [ "$UPDATE_TYPE" = "minor" ]; then
        npx npm-check-updates -u --target minor
        npm install
    fi

    npm test
    npm audit --audit-level=moderate
}

update_python() {
    pip install --upgrade pip
    pip-audit --fix
    safety check
    pytest
}

case "$ECOSYSTEM" in
    npm) update_npm ;;
    python) update_python ;;
    *)
        echo "Unknown ecosystem: $ECOSYSTEM"
        exit 1
        ;;
esac
```

## Tool Installation

```bash
# Python
pip install safety pip-audit pipenv pip-licenses

# JavaScript
npm install -g snyk npm-check-updates

# Go
go install golang.org/x/vuln/cmd/govulncheck@latest

# Rust
cargo install cargo-audit
```

## Best Practices

1. **Regular Scanning**: Run dependency scans daily via scheduled CI/CD
2. **Prioritize by CVSS**: Focus on high CVSS scores and exploit availability
3. **Staged Updates**: Auto-update patch versions, manual for major versions
4. **Test Coverage**: Always run full test suite after updates
5. **SBOM Generation**: Maintain up-to-date Software Bill of Materials
6. **License Compliance**: Check for restrictive licenses
7. **Rollback Strategy**: Create backup branches before major updates

Focus on automated vulnerability detection, risk assessment, and remediation across all major package ecosystems.
