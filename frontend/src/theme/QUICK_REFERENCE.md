# Quick Color Reference Guide

## Primary Brand Color
```
Navy Blue: #0b188f
Light Variant: #4f46e5
Lighter Variant: #e0e7ff
Dark Variant: #08107a
```

## How to Access Colors

### In React Components
```javascript
import { COLORS } from '../theme/colors';

// Example usage:
<button style={{ background: COLORS.primary.main }}>Click Me</button>
<div style={{ color: COLORS.text.primary }}>Text</div>
```

### In CSS Files
```css
.my-button {
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

.my-button:hover {
  background-color: var(--color-primary-dark);
  box-shadow: var(--shadow-hover);
}
```

### Using Utility Classes
```html
<!-- Buttons -->
<button class="btn-primary">Primary</button>
<button class="btn-secondary">Secondary</button>
<button class="btn-ghost">Ghost</button>

<!-- Cards & Layout -->
<div class="card">Content</div>
<div class="table-wrapper"><table>...</table></div>

<!-- Status Messages -->
<div class="alert alert-success">Success!</div>
<div class="alert alert-error">Error!</div>
<div class="alert alert-warning">Warning</div>

<!-- Badges -->
<span class="badge badge-doctor">Doctor</span>
<span class="badge badge-pharmacist">Pharmacist</span>
```

## Color Palette Quick Reference

### Status Indicators
- ✅ Success: bg=#d1fae5, text=#065f46
- ❌ Error: bg=#fee2e2, text=#991b1b  
- ⚠️ Warning: bg=#fef3c7, text=#92400e
- ℹ️ Info: bg=#dbeafe, text=#1e40af

### Text Hierarchy
1. Primary Text: #1e293b (main content)
2. Secondary Text: #64748b (labels)
3. Tertiary Text: #94a3b8 (hints)
4. Muted Text: #cbd5e1 (disabled)

### Interactive States
- Hover: Use COLORS.primary.dark or add shadow
- Active: Use darker variant
- Disabled: Use gray with opacity
- Focus: Use primary color border with light bg

## Component Examples

### Button Styling
```javascript
// Primary button with hover effect
<button style={{ 
  background: COLORS.primary.main, 
  color: '#fff', 
  padding: '8px 16px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s'
}} 
onMouseEnter={(e) => e.target.style.background = COLORS.primary.dark}
onMouseLeave={(e) => e.target.style.background = COLORS.primary.main}
>
  Save Changes
</button>
```

### Form Input with Theme
```javascript
<input 
  style={{
    border: `1px solid ${COLORS.input.border}`,
    borderRadius: '8px',
    padding: '9px 12px',
    background: COLORS.input.bg,
    transition: 'border 0.15s'
  }}
  onFocus={(e) => e.target.style.borderColor = COLORS.primary.main}
  onBlur={(e) => e.target.style.borderColor = COLORS.input.border}
  placeholder="Enter text..."
/>
```

### Card Component
```javascript
<div style={{
  background: COLORS.background.card,
  borderRadius: '14px',
  padding: '20px',
  boxShadow: COLORS.shadow.md
}}>
  <h3 style={{ color: COLORS.text.primary }}>Card Title</h3>
  <p style={{ color: COLORS.text.secondary }}>Card content</p>
</div>
```

### Alert Component
```javascript
<div style={{
  background: COLORS.success.bg,
  color: COLORS.success.color,
  border: `1px solid ${COLORS.success.border}`,
  borderRadius: '8px',
  padding: '12px 16px'
}}>
  Success! Your changes have been saved.
</div>
```

## CSS Variable Usage Examples

```css
/* Buttons */
.btn-primary {
  background-color: var(--color-primary);
  color: white;
  padding: 8px 18px;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
  box-shadow: var(--shadow-hover);
}

/* Card */
.card {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  box-shadow: var(--shadow-md);
}

/* Form Input */
.input {
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  background-color: var(--color-input-bg);
  transition: border 0.15s;
}

.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-lighter);
}

/* Alert */
.alert-success {
  background-color: var(--color-success-bg);
  color: var(--color-success);
  border-left: 4px solid var(--color-success-border);
  padding: var(--space-md);
  border-radius: var(--radius-md);
}

/* Table */
table thead {
  background-color: var(--color-table-header);
}

table td {
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-table-border);
}

table tbody tr:hover {
  background-color: var(--color-table-hover);
}
```

## Spacing Scale (for consistency)
```
xs:  4px   (--space-xs)
sm:  8px   (--space-sm)
md:  12px  (--space-md)
lg:  16px  (--space-lg)
xl:  20px  (--space-xl)
2xl: 24px  (--space-2xl)
3xl: 28px  (--space-3xl)
```

## Border Radius Scale (for consistency)
```
sm:   6px    (--radius-sm)
md:   8px    (--radius-md)
lg:   12px   (--radius-lg)
xl:   14px   (--radius-xl)
full: 9999px (--radius-full)
```

## Shadow Scale (for depth)
```
sm:    0 1px 4px rgba(0,0,0,0.1)
md:    0 2px 8px rgba(0,0,0,0.06)
lg:    0 2px 12px rgba(0,0,0,0.06)
xl:    0 25px 70px rgba(0,0,2,0.5)
hover: 0 4px 20px rgba(0,0,0,0.15)
```

---

**TIP**: When building new components, always reference COLORS object or CSS variables first before using hardcoded colors. This ensures consistency across the application!
