# Expo + React Native Web: Common Pitfalls and Fixes

> A practical troubleshooting guide for deploying Expo / React Native apps to the web,
> based on real production debugging of the GAVIGO IRE mobile app.
>
> **Stack**: Expo SDK 54, React 19, NativeWind v4, react-native-reanimated v4,
> @gorhom/bottom-sheet v5, Zustand 5, Expo Router v6

---

## Table of Contents

1. [The Symptom: React Error #185](#1-the-symptom-react-error-185)
2. [Pitfall 1: `className` on `Animated.View`](#2-pitfall-1-classname-on-animatedview)
3. [Pitfall 2: Zustand Selector Reference Equality](#3-pitfall-2-zustand-selector-reference-equality)
4. [Pitfall 3: `@gorhom/bottom-sheet` on Web](#4-pitfall-3-gorhombottom-sheet-on-web)
5. [Pitfall 4: Expo Router v6 Directory Route Names](#5-pitfall-4-expo-router-v6-directory-route-names)
6. [Pitfall 5: Unstable WebSocket Callbacks](#6-pitfall-5-unstable-websocket-callbacks)
7. [Debugging Strategy: Per-Component Error Boundaries](#7-debugging-strategy-per-component-error-boundaries)
8. [Quick Reference Checklist](#8-quick-reference-checklist)

---

## 1. The Symptom: React Error #185

When deploying a React Native app to the web via Expo, you may encounter a white
screen crash with this error in the console:

```
Minified React error #185
Maximum update depth exceeded. This can happen when a component repeatedly calls
setState inside componentWillUpdate or componentDidUpdate. React limits the number
of nested updates to prevent infinite loops.
```

This error means a component is re-rendering infinitely in a synchronous loop.
On native (iOS/Android), you might never see this because the rendering pipeline
and library internals differ. **The web platform is uniquely sensitive** to several
patterns that are harmless on native.

The sections below cover the five root causes we discovered, ordered by how
difficult they were to diagnose.

---

## 2. Pitfall 1: `className` on `Animated.View`

### Severity: Critical (instant crash on web)

### The Problem

When using **NativeWind v4** with **react-native-reanimated v4**, applying a
`className` prop to `Animated.View` causes an **infinite re-render loop** on the
web platform. This happens because:

1. NativeWind intercepts `className` and transforms it into a `style` object
2. Reanimated's `Animated.View` also manages styles internally for animations
3. On the web, these two systems fight over the `style` prop, each triggering
   the other to re-render, creating an infinite loop

On native platforms, the NativeWind + Reanimated integration uses a different
code path and works fine. The conflict is **web-only**.

### What Crashes

```tsx
// BAD: Will infinite-loop on web
<Animated.View
  style={[pauseStyle]}
  className="absolute inset-0 items-center justify-center"
  pointerEvents="none"
>
  <Text>Paused</Text>
</Animated.View>
```

```tsx
// BAD: Even simple utility classes crash
<Animated.View
  style={animatedStyle}
  className="w-1.5 h-1.5 rounded-full bg-text-tertiary"
/>
```

```tsx
// BAD: Dynamic className also crashes
<Animated.View
  entering={FadeInUp.duration(200)}
  className={`flex-row mb-3 ${
    item.role === 'user' ? 'justify-end' : 'justify-start'
  }`}
>
```

### The Fix

Replace all `className` props on `Animated.View` with inline `style` objects:

```tsx
// GOOD: Inline style only
<Animated.View
  style={[
    pauseStyle,
    {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
  ]}
  pointerEvents="none"
>
  <Text>Paused</Text>
</Animated.View>
```

```tsx
// GOOD: All visual props in style
<Animated.View
  style={[
    style,
    {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#555568',
    },
  ]}
/>
```

```tsx
// GOOD: Dynamic values in style object
<Animated.View
  entering={FadeInUp.duration(200)}
  style={{
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
  }}
>
```

### Rule

> **NEVER use `className` on `Animated.View` when targeting web.**
> Always use the `style` prop. Regular `View`, `Text`, and other non-animated
> components can still use `className` safely.

### Files We Fixed

| File | Instances |
|------|-----------|
| `components/feed/VideoPlayer.tsx` | 2 (pause indicator, heart animation) |
| `components/feed/AIChatEmbed.tsx` | 1 (typing dot) |
| `components/feed/GameEmbed.tsx` | 1 (tap-to-play hint) |
| `components/feed/GameEmbed.web.tsx` | 1 (tap-to-play hint) |
| `components/social/LikeButton.tsx` | 2 (button container, flash overlay) |
| `app/(tabs)/chat/index.tsx` | 2 (typing dot, message bubble) |

---

## 3. Pitfall 2: Zustand Selector Reference Equality

### Severity: Critical (instant crash on web, can also crash native)

### The Problem

Zustand uses `Object.is` comparison to decide whether a selector's return value
has changed. If the value has changed (by reference), the component re-renders.

The pattern `?? []` or `?? {}` as a fallback in a Zustand selector creates a
**new array/object reference on every call**. Since `[] !== []` by reference,
Zustand thinks the state changed, re-renders the component, which calls the
selector again, which creates yet another new `[]`, and so on — infinite loop.

### What Crashes

```tsx
// BAD: Creates new [] on every selector call when comments[contentId] is undefined
const comments = useSocialStore((s) => s.comments[contentId] ?? []);
```

```tsx
// BAD: Same problem with objects
const userData = useStore((s) => s.users[id] ?? {});
```

```tsx
// BAD: Also crashes with default arrays
const items = useStore((s) => s.itemMap[key] || []);
```

### The Fix

Define the fallback value as a **module-level constant** so the same reference
is returned every time:

```tsx
// GOOD: Stable reference — same [] instance every time
const EMPTY_COMMENTS: Comment[] = [];

export function CommentSheet({ contentId }: Props) {
  const comments = useSocialStore(
    (s) => s.comments[contentId] ?? EMPTY_COMMENTS
  );
  // ...
}
```

```tsx
// GOOD: Works for objects too
const EMPTY_USER: UserData = { name: '', followers: 0 };

function Profile({ userId }: Props) {
  const user = useStore((s) => s.users[userId] ?? EMPTY_USER);
}
```

### Why This Is Hard to Find

- The crash only happens when the key is **missing from the map** (e.g.,
  `comments[contentId]` is `undefined`). If the data has loaded, the real
  array is returned and the fallback is never used.
- On initial render, before any API data loads, every content item's comments
  are `undefined`, so the fallback fires for every single `CommentSheet`
  instance simultaneously — instant crash.

### Rule

> **NEVER use `?? []`, `?? {}`, or `|| []` as inline fallbacks in Zustand
> selectors.** Always use a module-level constant for the default value.

### Files We Fixed

| File | Change |
|------|--------|
| `components/social/CommentSheet.tsx` | `?? []` → `?? EMPTY_COMMENTS` |
| `components/social/CommentSheet.web.tsx` | `?? []` → `?? EMPTY_COMMENTS` |

---

## 4. Pitfall 3: `@gorhom/bottom-sheet` on Web

### Severity: High (crash on import)

### The Problem

`@gorhom/bottom-sheet` relies on `react-native-reanimated` internals and gesture
handler APIs that do not fully work on react-native-web. Importing the library
at the top level of a module causes immediate crashes on the web platform, even
if the component is never rendered.

Additionally, when the web app is embedded as an **iframe** (as in our dashboard
phone mockup), gesture detection is even more unreliable.

### What Crashes

```tsx
// BAD: Top-level import crashes web at module evaluation time
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export default function RootLayout() {
  return (
    <BottomSheetModalProvider>
      {/* ... */}
    </BottomSheetModalProvider>
  );
}
```

```tsx
// BAD: Any component that imports from bottom-sheet will crash on web
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
```

### The Fix

**Strategy 1: Conditional `require` in shared layouts**

For the root layout where you need `BottomSheetModalProvider`, use a conditional
`require` that only loads on native:

```tsx
// GOOD: Conditional import — only loads on native
import { Platform } from 'react-native';

let BottomSheetModalProvider: React.ComponentType<{
  children: React.ReactNode;
}> | null = null;

if (Platform.OS !== 'web') {
  BottomSheetModalProvider =
    require('@gorhom/bottom-sheet').BottomSheetModalProvider;
}

export default function RootLayout() {
  const content = (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthGuard>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {BottomSheetModalProvider ? (
        <BottomSheetModalProvider>{content}</BottomSheetModalProvider>
      ) : (
        content
      )}
    </GestureHandlerRootView>
  );
}
```

**Strategy 2: Platform-specific files (`.web.tsx`)**

For components that use bottom-sheet features heavily, create a `.web.tsx`
counterpart that uses React Native's `Modal` instead:

```
components/social/
  CommentSheet.tsx       ← Uses @gorhom/bottom-sheet (native)
  CommentSheet.web.tsx   ← Uses Modal from react-native (web)
  CommentButton.tsx      ← Imports CommentSheet (native gets .tsx, web gets .web.tsx)
  CommentButton.web.tsx  ← Imports CommentSheet (resolved to .web.tsx on web)
```

Metro bundler automatically resolves `.web.tsx` over `.tsx` for web builds. The
web version should implement the same interface (same props, same ref API) but
use `Modal` + `FlatList` + `TextInput` instead of bottom-sheet components:

```tsx
// CommentSheet.web.tsx — Modal-based fallback
import { Modal, FlatList, TextInput } from 'react-native';

export function CommentSheet({ contentId, bottomSheetRef }: Props) {
  const [visible, setVisible] = useState(false);

  // Expose same API via ref
  useEffect(() => {
    if (bottomSheetRef && 'current' in bottomSheetRef) {
      (bottomSheetRef as React.MutableRefObject<any>).current = {
        present: () => setVisible(true),
        dismiss: () => setVisible(false),
      };
    }
  }, [bottomSheetRef]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      {/* Same visual design, using standard RN components */}
    </Modal>
  );
}
```

### Rule

> **NEVER import `@gorhom/bottom-sheet` in code that runs on web.** Use
> conditional `require` or platform-specific `.web.tsx` files.

### Files We Fixed / Created

| File | Change |
|------|--------|
| `app/_layout.tsx` | Conditional `require` for BottomSheetModalProvider |
| `components/social/CommentSheet.web.tsx` | Created Modal-based web fallback |
| `components/social/CommentButton.web.tsx` | Created to avoid importing native CommentSheet |

---

## 5. Pitfall 4: Expo Router v6 Directory Route Names

### Severity: Medium (screen renders blank or tab navigation breaks)

### The Problem

In Expo Router v6, when you use **directory-based routes** with an `index.tsx`
file inside a folder (e.g., `app/(tabs)/feed/index.tsx`), the `Tabs.Screen`
`name` prop must reference the full path including `/index`, not just the
directory name.

### What Breaks

```tsx
// BAD: Expo Router v6 can't resolve "feed" to "feed/index"
<Tabs.Screen name="feed" options={{ title: 'Feed' }} />
<Tabs.Screen name="explore" options={{ title: 'Explore' }} />
```

The tab may render blank, show the wrong screen, or produce a routing error.
This is a **v6 breaking change** from earlier Expo Router versions where the
directory name alone was sufficient.

### The Fix

```tsx
// GOOD: Use the full path with /index
<Tabs.Screen name="feed/index" options={{ title: 'Feed' }} />
<Tabs.Screen name="explore/index" options={{ title: 'Explore' }} />
<Tabs.Screen name="chat/index" options={{ title: 'AI Chat' }} />
<Tabs.Screen name="profile/index" options={{ title: 'Profile' }} />
```

### Rule

> In Expo Router v6 with directory routes (`app/(tabs)/feed/index.tsx`),
> always use `name="feed/index"` in `Tabs.Screen`, not `name="feed"`.

---

## 6. Pitfall 5: Unstable WebSocket Callbacks

### Severity: Medium (reconnection loops, excessive re-renders)

### The Problem

A custom `useWebSocket` hook that destructures callback options and includes
them in `useCallback` dependency arrays becomes unstable when callers pass
inline arrow functions. Each render creates new function references, which
invalidates the `useCallback`, which re-creates the message handler, which
can trigger a reconnect, which triggers a re-render, and so on.

### What Causes Loops

```tsx
// BAD: Every option callback is in the dependency array
export function useWebSocket(options: UseWebSocketOptions) {
  const {
    onConnectionEstablished,
    onDecisionMade,
    onScoreUpdate,
    // ...9 callbacks total
  } = options;

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      switch (message.type) {
        case 'connection_established':
          onConnectionEstablished?.(message.payload);
          break;
        case 'score_update':
          onScoreUpdate?.(message.payload);
          break;
        // ...
      }
    },
    [
      onConnectionEstablished,  // New reference every render!
      onDecisionMade,           // New reference every render!
      onScoreUpdate,            // New reference every render!
      // ...
    ]
  );

  const connect = useCallback(() => {
    // Uses handleMessage — so it also re-creates when handleMessage changes
    ws.onmessage = (e) => handleMessage(JSON.parse(e.data));
  }, [handleMessage]);

  // connect changes → useEffect re-runs → reconnects → state update → re-render → repeat
}
```

### The Fix

Store the options object in a `useRef` so that `handleMessage` and `connect`
have **empty dependency arrays** and remain stable across renders:

```tsx
// GOOD: Options in ref, callbacks are stable
export function useWebSocket(options: UseWebSocketOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options; // Always points to latest callbacks

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      const opts = optionsRef.current; // Read latest at call time
      switch (message.type) {
        case 'connection_established':
          opts.onConnectionEstablished?.(message.payload);
          break;
        case 'score_update':
          opts.onScoreUpdate?.(message.payload);
          break;
        // ...
      }
    },
    [] // Stable! No callback dependencies
  );

  const connect = useCallback(() => {
    ws.onmessage = (e) => handleMessage(JSON.parse(e.data));
  }, [handleMessage]); // handleMessage is stable, so connect is too
}
```

This pattern is safe because `handleMessage` is only called asynchronously
(on WebSocket message), by which time `optionsRef.current` will have the
latest callbacks.

### Rule

> When a hook accepts callback options that callers may pass as inline arrows,
> store the options in a `useRef` and read from the ref inside `useCallback`
> handlers. This keeps the handler stable regardless of caller re-renders.

---

## 7. Debugging Strategy: Per-Component Error Boundaries

When the app crashes with Error #185 and you have many components rendering
in a list, it can be extremely difficult to identify which component is the
culprit. Here is a systematic approach.

### Step 1: Isolate the Screen

Strip down the crashing screen to its minimum. If you have a feed with
`ContentCard` + `ContentOverlay`, remove `ContentOverlay` entirely and see
if `ContentCard` alone renders. This narrows the search to one component tree.

### Step 2: Per-Component Error Boundaries

Wrap each child component in a class-based error boundary that catches the
crash and renders a visible label instead of crashing the entire app:

```tsx
import React from 'react';
import { Text } from 'react-native';

class Safe extends React.Component<
  { name: string; children: React.ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null };

  static getDerivedStateFromError(e: Error) {
    return { error: e.message };
  }

  render() {
    if (this.state.error) {
      return (
        <Text style={{ color: 'red', fontSize: 10 }}>
          CRASH:{this.props.name}:{this.state.error?.substring(0, 40)}
        </Text>
      );
    }
    return this.props.children;
  }
}
```

Then wrap every suspect component:

```tsx
<Safe name="Avatar">
  <Avatar name={item.theme} size="sm" />
</Safe>
<Safe name="FollowButton">
  <FollowButton userId={`gavigo_${item.theme}`} compact />
</Safe>
<Safe name="LikeButton">
  <LikeButton contentId={item.id} initialCount={baseLikes} />
</Safe>
<Safe name="CommentButton">
  <CommentButton contentId={item.id} initialCount={baseComments} />
</Safe>
```

### Step 3: Read the Output

Deploy and check the rendered output. You will see something like:

```
Avatar:OK  FollowButton:OK  LikeButton:OK
CRASH:CommentButton:Minified React error #185
ShareButton:OK  Badge:OK
```

This immediately tells you `CommentButton` (and its child `CommentSheet`) is
the source. From there, inspect the component and its dependencies to find the
specific re-render trigger.

### Step 4: Clean Up

After fixing the issue, remove all `Safe` wrappers and rebuild.

---

## 8. Quick Reference Checklist

Use this checklist before deploying an Expo app to the web:

### Animated Components
- [ ] No `Animated.View` has a `className` prop (use `style` only)
- [ ] No `Animated.Text` has a `className` prop (use `style` only)
- [ ] All reanimated animations use GPU-composited props (`opacity`, `transform`)

### Zustand Selectors
- [ ] No selector uses `?? []` or `?? {}` with inline literals
- [ ] All fallback values are module-level constants
- [ ] Selectors return stable references for unchanged data

### Native-Only Libraries
- [ ] `@gorhom/bottom-sheet` is not imported on web (use `.web.tsx` fallback)
- [ ] `BottomSheetModalProvider` is conditionally loaded via `Platform.OS` check
- [ ] Any other native-only library has a web fallback or conditional import

### Expo Router
- [ ] `Tabs.Screen` names match the full file path (e.g., `feed/index` not `feed`)
- [ ] Route groups `(auth)`, `(tabs)` are properly declared in layouts

### Hook Stability
- [ ] WebSocket/event handler hooks use `useRef` for callback options
- [ ] `useCallback` dependency arrays don't include unstable function references
- [ ] `FlatList` callbacks (`onViewableItemsChanged`, `viewabilityConfig`) use `useRef`

### General Web Compatibility
- [ ] Test on web (`npx expo start --web`) before building Docker image
- [ ] Test in iframe context if the app will be embedded
- [ ] Check browser console for Error #185 warnings during development

---

## Appendix: Commit Reference

All fixes described in this guide were applied in commit
[`ae98acb`](../../) (`fix(mobile): resolve infinite re-render crashes on web platform`),
fixing 12 files and adding 1 new file (`CommentButton.web.tsx`).

| File | Pitfall Fixed |
|------|---------------|
| `app/_layout.tsx` | #3 (bottom-sheet conditional load) |
| `app/(tabs)/_layout.tsx` | #4 (route names) |
| `app/(tabs)/chat/index.tsx` | #1 (className on Animated.View) |
| `app/(tabs)/feed/index.tsx` | General cleanup |
| `components/feed/AIChatEmbed.tsx` | #1 (className on Animated.View) |
| `components/feed/GameEmbed.tsx` | #1 (className on Animated.View) |
| `components/feed/GameEmbed.web.tsx` | #1 (className on Animated.View) |
| `components/feed/VideoPlayer.tsx` | #1 (className on Animated.View) |
| `components/social/CommentSheet.tsx` | #2 (Zustand selector) |
| `components/social/CommentSheet.web.tsx` | #2 (Zustand selector) + #3 (web fallback) |
| `components/social/CommentButton.web.tsx` | #3 (web fallback, new file) |
| `components/social/LikeButton.tsx` | #1 (className on Animated.View) |
| `hooks/useWebSocket.ts` | #5 (unstable callbacks) |
