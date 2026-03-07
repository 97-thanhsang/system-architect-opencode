# Skill: angular-tooling

> **Source**: analogjs/angular-skills/angular-tooling  
> **Version**: 1.0.0  
> **Description**: Angular Development Tools and configuration

---

## Overview

This skill provides guidance for Angular development tooling including:
- ESLint and Prettier configuration
- Angular CLI customization
- Build optimization
- Development workflow improvements
- Debugging techniques

---

## Quick Start

### ESLint Configuration

```json
// .eslintrc.json
{
  "root": true,
  "ignorePatterns": ["projects/**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      "extends": [
        "@angular-eslint/recommended",
        "@angular-eslint/template/process-inline-templates"
      ],
      "rules": {
        "@angular-eslint/directive-selector": [
          "error",
          { "type": "attribute", "prefix": "app", "style": "camelCase" }
        ],
        "@angular-eslint/component-selector": [
          "error",
          { "type": "element", "prefix": "app", "style": "kebab-case" }
        ]
      }
    }
  ]
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100
}
```

---

## Angular CLI Commands

### Generate with Options

```bash
# Generate component with inline template and styles
ng g c my-component --inline-template --inline-style

# Generate module with routing
ng g m my-module --routing

# Generate service in specific path
ng g s services/api --skip-tests
```

---

## Best Practices

1. **Use strict mode** for type checking
2. **Configure path aliases** in tsconfig.json
3. **Use lint-staged** for pre-commit hooks
4. **Enable source maps** in development
5. **Use Angular DevTools** browser extension

---

*Part of AnalogJS Angular Skills Collection*
