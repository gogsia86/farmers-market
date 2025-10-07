  Divine Design System Documentation

## Overview

The Divine Design System is a comprehensive, quantum-aware design system that provides a set of harmonious components, styles, and patterns for creating elevated web experiences. This system integrates cosmic design principles with practical implementation, offering both aesthetic beauty and functional excellence.

## Core Principles

1. **Quantum Awareness**: Components maintain state consciousness across multiple dimensions
2. **Divine Harmony**: Colors, typography, and spacing follow cosmic proportions
3. **Temporal Fluidity**: Animations and transitions flow naturally through time
4. **Adaptive Intelligence**: Components respond intelligently to user interaction
5. **Cosmic Scale**: Design patterns that work from micro to macro levels

## Getting Started

### Installation

```bash
# Import core styles in your app's entry point
import '@/design-system/styles/global.css';
import '@/design-system/styles/theme.css';
import '@/design-system/styles/animations.css';

# Wrap your app with ThemeProvider
import { ThemeProvider } from '@/design-system/providers/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

### Theme Configuration

The design system provides a comprehensive theming system with support for both light and dark modes:

```typescript
// Access theme values in your components
import { useTheme } from '@/design-system/hooks/useTheme';

function Component() {
  const { theme, mode, toggleMode } = useTheme();
  
  return (
    <div style={{ color: theme.colors.cosmic.primary }}>
      <button onClick={toggleMode}>Toggle Theme</button>
    </div>
  );
}
```

## Design Tokens

### Colors

```typescript
// Cosmic Primary Colors
--cosmic-primary: #667eea;
--cosmic-primary-dark: #5a6fd8;
--cosmic-primary-light: #7c8fee;
--cosmic-secondary: #764ba2;
--cosmic-accent: #f093fb;

// Galactic Neutrals
--stardust-white: #ffffff;
--moonlight: #f8fafc;
--twilight: #e2e8f0;
--midnight: #1e293b;
--void-black: #0f172a;

// Celestial Accents
--sunset-orange: #f59e0b;
--nebula-pink: #ec4899;
--quantum-blue: #06b6d4;
--starlight-yellow: #fbbf24;
--aurora-green: #10b981;
```

### Typography

```typescript
// Font Families
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-heading: 'Poppins', Inter, sans-serif;
--font-mono: 'Fira Code', Courier New, monospace;

// Font Sizes
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
--text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
--text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
// ... (see typography.ts for full scale)
```

## Components

### Button

The Button component provides quantum-aware interaction states and divine animations.

```typescript
import { Button } from '@/design-system/components/Button';

<Button 
  variant="primary" // 'primary' | 'secondary' | 'ghost'
  size="md" // 'sm' | 'md' | 'lg'
  hasGlow
  hasSparkle
>
  Divine Action
</Button>
```

### Card

The Card component offers multiple variants with divine interaction effects.

```typescript
import { Card } from '@/design-system/components/Card';

<Card
  variant="glass" // 'default' | 'glass' | 'cosmic'
  hasGlow
  hasTilt
>
  <h3>Cosmic Content</h3>
  <p>Divine description text</p>
</Card>
```

## Animation System

### Hooks

#### useAnimation

```typescript
import { useAnimation } from '@/design-system/hooks/useAnimation';

function Component() {
  const { ref, style, isVisible } = useAnimation({
    duration: 600,
    delay: 0,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  });

  return <div ref={ref} style={style}>Animated Content</div>;
}
```

#### useMotion

```typescript
import { useParallax, useMagnetic } from '@/design-system/hooks/useMotion';

function Component() {
  const parallaxRef = useParallax({ speed: 0.5 });
  const magneticRef = useMagnetic({ strength: 50 });

  return (
    <>
      <div ref={parallaxRef}>Parallax Element</div>
      <button ref={magneticRef}>Magnetic Button</button>
    </>
  );
}
```

### CSS Classes

The design system provides a rich set of animation utility classes:

```html
<div class="animate-fade-in">Fade In</div>
<div class="animate-fade-in-up delay-200">Fade In Up</div>
<div class="animate-scale-in duration-700">Scale In</div>
<div class="animate-cosmic-pulse">Cosmic Pulse</div>
```

## Best Practices

1. **Component Usage**
   - Always wrap your app with ThemeProvider
   - Use semantic HTML elements inside components
   - Leverage provided hooks for animations and interactions

2. **Theme Customization**
   - Extend the theme using the provided TypeScript types
   - Use CSS variables for dynamic values
   - Follow the cosmic color system for harmony

3. **Performance**
   - Use lazy loading for heavy components
   - Leverage CSS transforms for animations
   - Implement proper will-change properties

4. **Accessibility**
   - Ensure proper color contrast ratios
   - Provide reduced motion alternatives
   - Maintain semantic HTML structure

## Contributing

When adding new components or features to the design system:

1. Follow the quantum design principles
2. Maintain type safety with TypeScript
3. Add proper documentation and examples
4. Include animation and interaction patterns
5. Ensure theme compatibility
6. Add accessibility features
7. Write comprehensive tests

## Version History

- 1.0.0 - Initial release with core components
- 1.1.0 - Added animation system
- 1.2.0 - Added dark mode support
- 1.3.0 - Enhanced quantum effects