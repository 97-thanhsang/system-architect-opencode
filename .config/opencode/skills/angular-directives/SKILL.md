# Skill: angular-directives

> **Source**: analogjs/angular-skills/angular-directives  
> **Version**: 1.0.0  
> **Description**: Angular Directives and custom directives

---

## Overview

This skill provides guidance for Angular Directives including:
- Built-in directives (*ngIf, *ngFor, ngClass, ngStyle)
- Attribute directives
- Structural directives
- Custom directive creation

---

## Quick Start

### Custom Attribute Directive

```typescript
// directives/highlight.directive.ts
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  @Input() appHighlight = 'yellow';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.appHighlight);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
```

### Usage

```html
<p appHighlight="lightblue">Hover over this text</p>
```

---

## Built-in Directives

### Control Flow (Angular 17+)

```html
@if (user) {
  <div>Welcome {{ user.name }}</div>
} @else {
  <div>Please login</div>
}

@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}
```

### NgClass & NgStyle

```html
<div [ngClass]="{ 'active': isActive, 'disabled': isDisabled }">
<div [ngStyle]="{ 'color': textColor, 'font-size': fontSize + 'px' }">
```

---

## Best Practices

1. **Use standalone directives** (Angular 15+)
2. **Prefix custom directives** (app-*)
3. **Use HostBinding** for cleaner property binding
4. **Avoid complex logic** in directives

---

*Part of AnalogJS Angular Skills Collection*
