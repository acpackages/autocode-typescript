# AC Runtime Router

> Client-side router for AC Runtime applications with route guards and declarative navigation.

## Overview

A lightweight SPA router built on the Web Components API. Provides:

- **`<ac-router-outlet>`** — Renders the matched component.
- **`<ac-router-link to="/path">`** — Declarative navigation (no page reload).
- **`AcRouter`** — Singleton router service with subscribe/navigate/match API.
- **`provideRouter(routes)`** — One-call bootstrap function.

## Installation

```bash
npm install @autocode-ts/ac-runtime-router
```

## Quick Start

```typescript
import { provideRouter } from '@autocode-ts/ac-runtime-router';

provideRouter([
  { path: '/', component: 'app-home' },
  { path: '/about', component: 'app-about' },
  { path: '/settings', component: 'app-settings' },
  { path: '*', component: 'app-not-found' },
]);
```

```html
<nav>
  <ac-router-link to="/">Home</ac-router-link>
  <ac-router-link to="/about">About</ac-router-link>
  <ac-router-link to="/settings">Settings</ac-router-link>
</nav>
<ac-router-outlet></ac-router-outlet>
```

## Route Guards

Prevent navigation with async guard functions:

```typescript
provideRouter([
  {
    path: '/admin',
    component: 'admin-panel',
    canActivate: async () => {
      const user = await fetchCurrentUser();
      return user.isAdmin;
    },
  },
]);
```

## Programmatic Navigation

```typescript
import { AcRouter } from '@autocode-ts/ac-runtime-router';

const router = AcRouter.getInstance();

// Navigate
router.navigate('/dashboard');

// Subscribe to route changes
const unsub = router.subscribe((url) => {
  console.log('Navigated to:', url);
});

// Cleanup
unsub();
```

## API Reference

### `Route` Interface

| Property | Type | Description |
|----------|------|-------------|
| `path` | `string` | URL path to match (exact). Use `'*'` for wildcard. |
| `component` | `string` | Custom element tag name to render. |
| `canActivate` | `() => boolean \| Promise<boolean>` | Optional navigation guard. |

### `AcRouter` (Singleton)

| Method | Description |
|--------|-------------|
| `getInstance()` | Returns the singleton instance. |
| `setRoutes(routes)` | Register the route table. |
| `navigate(path)` | Push history state and notify listeners. |
| `subscribe(callback)` | Listen for URL changes. Returns unsubscribe function. |
| `match(url)` | Find the matching route for a URL. |

### Custom Elements

| Element | Description |
|---------|-------------|
| `<ac-router-outlet>` | Renders the component matching the current URL. |
| `<ac-router-link to="/path">` | Clickable navigation link (prevents full reload). |
