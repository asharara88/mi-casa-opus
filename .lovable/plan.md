
# Apply Logo to Navigation & Add Theme Toggle

## Overview

This plan implements two UI enhancements:
1. **Replace the Building2 icon with the official MiCasa logo** in the sidebar header
2. **Add a light/dark theme toggle** that allows users to switch between themes

---

## Current State

- **Sidebar**: Uses a generic `Building2` icon with hardcoded "Mi Casa / Real Estate" text
- **Theme**: Application is dark-only (hardcoded `html { @apply dark; }` in CSS)
- **ThemeProvider**: The project has `next-themes` installed but no `ThemeProvider` is configured

---

## Implementation Components

### 1. Theme Provider Setup

Add the `ThemeProvider` from `next-themes` to wrap the application in `App.tsx`:

```tsx
import { ThemeProvider } from "next-themes";

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      {/* ... existing providers */}
    </QueryClientProvider>
  </ThemeProvider>
);
```

### 2. Theme Toggle Component

Create a new component `src/components/layout/ThemeToggle.tsx`:

| Feature | Implementation |
|---------|----------------|
| Icon | Sun for light mode, Moon for dark mode |
| Style | Consistent with existing sidebar buttons |
| Tooltip | Shows current mode and action |
| Animation | Smooth icon rotation transition |

```tsx
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  );
}
```

### 3. Sidebar Logo Integration

Update `src/components/layout/Sidebar.tsx` to use the `MiCasaLogo` component:

**Before:**
```tsx
<div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
  <Building2 className="w-5 h-5 text-primary-foreground" />
</div>
<span className="font-semibold">Mi Casa</span>
<span className="text-xs">Real Estate</span>
```

**After:**
```tsx
import { MiCasaLogo } from '@/components/branding/MiCasaLogo';

<MiCasaLogo 
  width={collapsed ? 36 : 140} 
  height="auto"
  className="transition-all duration-300"
/>
```

### 4. Theme Toggle Placement

Add the theme toggle in two locations for accessibility:

| Location | Visibility | Purpose |
|----------|------------|---------|
| Sidebar footer | Desktop (expanded) | Primary toggle with label |
| Header | Always visible | Quick access on mobile |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Wrap with `ThemeProvider` from next-themes |
| `src/components/layout/ThemeToggle.tsx` | **New file** - Theme toggle component |
| `src/components/layout/Sidebar.tsx` | Replace Building2 icon with MiCasaLogo, add theme toggle in footer |
| `src/components/layout/Header.tsx` | Add theme toggle button for mobile accessibility |
| `src/index.css` | Remove hardcoded `html { @apply dark; }` to allow theme switching |

---

## Visual Changes

### Sidebar Header (Before vs After)

```text
BEFORE:                          AFTER:
┌────────────────────┐          ┌────────────────────┐
│ [□] Mi Casa        │          │ MI CASA | Property │
│     Real Estate    │          │          Solutions │
└────────────────────┘          └────────────────────┘
```

### Sidebar Footer with Theme Toggle

```text
┌────────────────────────────┐
│ ○ Theme: Dark    [☀/☽]    │
│ [←] Collapse               │
└────────────────────────────┘
```

### Collapsed Sidebar

When collapsed, the logo will shrink to an icon-sized version and the theme toggle shows only the icon.

---

## Technical Details

### ThemeProvider Configuration

```tsx
<ThemeProvider 
  attribute="class"           // Toggle via CSS class
  defaultTheme="dark"         // Keep dark as default
  enableSystem={false}        // Don't auto-detect OS preference
  disableTransitionOnChange   // Prevent flash during transition
>
```

### Logo Responsiveness

The `MiCasaLogo` component already supports:
- `width` prop for sizing
- `useImage={true}` for the PNG version (optimized for dark backgrounds)
- CSS filter for theme adaptation when needed

### CSS Theme Variable Handling

The existing `src/index.css` already defines both `.dark` and `.light` theme variables, so no additional CSS changes are needed beyond removing the forced dark mode.

---

## Security Considerations

- No security implications - this is purely a UI enhancement
- Theme preference stored in localStorage via next-themes (client-side only)
