# @present-day/device

Phone and tablet frames for screenshots, embedded pages and live content. Every frame is drawn in CSS from one set of proportions in [`src/core/devices.ts`](src/core/devices.ts), so a change there reaches every site that uses the package.

The frame takes its shape from the content: the phone screen is 390 × 844 CSS pixels (an iPhone 12 to 14), so a screenshot or a page laid out at that size fills it exactly.

```sh
npm i @present-day/device
```

## React

```tsx
import { Device } from '@present-day/device'

// A screenshot
<Device src="/shots/map.webp" alt="The map" className="w-72" />

// A live page, laid out at 390 × 844 and scaled to fit
<Device iframe="https://example.com/demo" title="Live demo" className="w-72" />

// Anything else
<Device className="w-72">
  <MessageThread />
</Device>
```

The stylesheet is imported for you. Give the device a width, or a `maxHeight` (any CSS length); its height follows from the shape.

| Prop                             | Default         |                                                                                                            |
| -------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------- |
| `device`                         | `'phone'`       | `'phone'`, `'tablet'` (1180 × 820), or your own `DeviceSpec`                                               |
| `cutout`                         | the device's    | `'island'` or `'none'`. Over an iframe it defaults to `'none'`, since the embedded page has no safe area   |
| `maxHeight`                      |                 | Any CSS length; the width shrinks to keep the whole device in it                                           |
| `src`, `alt`, `imgProps`         |                 | A screenshot, drawn at the screen's size                                                                   |
| `iframe`, `title`, `iframeProps` |                 | A page laid out at the viewport and scaled to the screen. Wins over `src` and `children`                   |
| `children`, `fit`                | `fit: 'screen'` | Any content. `fit: 'viewport'` lays it out at the viewport and scales it like an iframe                    |
| `interactive`                    | `false`         | Lets pointer events reach the screen. Off, an iframe also leaves the tab order, so it never traps a scroll |
| `overlay`                        |                 | Drawn over the screen and stays interactive, e.g. a poster until the page has drawn                        |
| `fallback`                       |                 | Replaces the iframe, laid out at the viewport, once it has failed                                          |
| `loadTimeout`                    |                 | Milliseconds the iframe gets after it first scrolls into view before it counts as failed                   |
| `ready`, `failed`                |                 | Outside signals, e.g. from `postMessage`, since `load` can fire before hydration                           |
| `onStatusChange`                 |                 | `'loading'`, `'ready'` or `'failed'`                                                                       |

## Without React

`deviceHTML()` returns the same frame as an HTML string, for Markdown output or other server-rendered pages. It uses only `<span>` and `<img>`, so it can sit inside a `<button>` or `<figure>`. Load `@present-day/device/styles.css` on the page.

```ts
import { deviceHTML } from '@present-day/device/core'

deviceHTML({ src: '/shots/map.webp', alt: 'The map', width: 390, height: 844 })
```

`@present-day/device/core` has no React, no stylesheet import and no `"use client"`, so it is safe in build scripts and React Native. `deviceGeometry(device, width)` gives every measurement in your own units for renderers that can't use the stylesheet.

## Theming

| Custom property            | Default                                                                     |
| -------------------------- | --------------------------------------------------------------------------- |
| `--pd-device-color`        | `#1c1c1e` (body and buttons)                                                |
| `--pd-device-screen-color` | `#000` (behind content while it loads)                                      |
| `--pd-device-edge`         | `hsl(0 0% 50% / 0.25)` (hairline that keeps the body visible on dark pages) |
| `--pd-device-shadow`       | `0 24px 48px -24px rgb(0 0 0 / 0.45)`                                       |

## Development

```sh
bun install
bun run storybook
bun run test
```
