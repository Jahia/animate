# animate

A [Jahia](https://www.jahia.com) community module that adds scroll-triggered CSS animations to any content node via the `jmix:animate` mixin. Powered by [animate.css 4.1.1](https://animate.style/).

## Features

- 94 animations from animate.css 4.1.1 (entrances, exits, attention seekers)
- Scroll-triggered via `IntersectionObserver` — animation fires only when content enters the viewport
- Two delay modes: delay before the animation starts (CSS) or delay before the content appears (JS)
- Loop support with a pause/resume control (WCAG 2.2.2)
- Full WCAG 2.1 AA compliance: `inert`, `aria-hidden`, `prefers-reduced-motion`, exit-animation focus management
- Zero jQuery dependency — vanilla JS only
- Works as a skin on any content node that supports the `jmix:animate` mixin

## Requirements

| Requirement | Version |
|-------------|---------|
| Jahia | 8.2.0.0+ |
| Java | 11+ |
| Maven | 3.6+ |
| Node.js | 20.x (build only) |

## Installation

### From the Jahia Store

Deploy the module JAR directly from the Jahia Store or the Jahia administration panel.

### Build from source

```bash
git clone https://github.com/pvollenweider/animate.git
cd animate
mvn clean install
```

The JAR is produced at `target/animate-<version>.jar`. Deploy it via the Jahia administration panel or the provisioning API:

```bash
curl -u root:<password> \
  -X POST http://localhost:8080/modules/api/provisioning \
  --form 'script=[{"installAndStartBundle":"animate-<version>.jar","forceUpdate":true}]' \
  --form 'file=@target/animate-<version>.jar'
```

### Enable on a site

In the Jahia administration panel, go to **Site settings → Modules** and enable the `animate` module on your site.

## Usage

### Applying an animation in jContent

The module registers `animate.animate.jsp` as a **skin** (`type = skin`) on the `jmix:animate` mixin. For any `jnt:content` node, open the content editor and expand the **Layout** accordion. An **Add animation** section appears:

1. **Animation** — choose from the dropdown, e.g. *Fading Entrances / In* (`fadeIn`). 94 options across 16 categories — see [animation list](#animation-list).
2. **Delay in seconds (0–30)** — how long to wait before the animation starts (default `0.0`).
3. **Duration (in s)** — override the animation speed (leave blank to use the animate.css default).
4. **Iteration** — how many times the animation plays: `1` (default), `2`, `3`, or `Infinite (WCAG 2.2.2 — decorative use only)`.
5. **How to use delay?** — controls how the delay is applied:
   - **Wait before starting the animation** (default) — the content is visible immediately when it enters the viewport; the CSS `animation-delay` property holds the animation for the configured duration. Content remains readable even if animation is skipped.
   - **Wait before displaying the component** — the content wrapper stays hidden (`opacity: 0`, `visibility: hidden`) until the delay expires, then reveals and plays the animation. Use for staged reveals where the content must not be visible before its cue.

> Users with `prefers-reduced-motion: reduce` always see the content immediately — animation classes are never applied and JS delays are skipped.

### Properties reference

| Property | Label in UI | Type | Default | Description |
|----------|------------|------|---------|-------------|
| `j:animation` | Animation | `string` | `fadeIn` | animate.css class name. 94 options. |
| `j:animationDelay` | Delay in seconds (0–30) | `double` | `0` | Delay before animation or display, depending on `j:animationDelayUsage`. |
| `j:animationDuration` | Duration (in s) | `double` | _(CSS default)_ | Overrides the animation duration. |
| `j:animationIterationCount` | Iteration | `string` | `1` | `1`, `2`, `3`, or `infinite`. |
| `j:animationDelayUsage` | How to use delay? | `string` | `delayBeforeAnimation` | `delayBeforeAnimation` or `delayBeforeDisplay`. |

### Looping animations and the pause control

When `j:animationIterationCount` is set to `2`, `3`, or `infinite`, a pause/resume button is injected into the wrapper. The button:
- Appears in the top-right corner of the animated element
- Is a native `<button>` (keyboard accessible)
- Uses `aria-pressed` to communicate its state to screen readers
- Toggles CSS `animation-play-state` between `running` and `paused`

> **WCAG 2.2.2 — Pause, Stop, Hide:** looping animations that last more than 5 seconds must provide a pause mechanism. This module provides one automatically.

## Animation list

Animations are grouped by category. All 94 names from animate.css 4.1.1 are supported.

| Category | Animations |
|----------|-----------|
| **Attention Seekers** | `bounce`, `flash`, `headShake`, `heartBeat`, `jello`, `pulse`, `rubberBand`, `shakeX`, `shakeY`, `swing`, `tada`, `wobble` |
| **Back Entrances** | `backInDown`, `backInLeft`, `backInRight`, `backInUp` |
| **Back Exits** | `backOutDown`, `backOutLeft`, `backOutRight`, `backOutUp` |
| **Bouncing Entrances** | `bounceIn`, `bounceInDown`, `bounceInLeft`, `bounceInRight`, `bounceInUp` |
| **Bouncing Exits** | `bounceOut`, `bounceOutDown`, `bounceOutLeft`, `bounceOutRight`, `bounceOutUp` |
| **Fading Entrances** | `fadeIn`, `fadeInBottomLeft`, `fadeInBottomRight`, `fadeInDown`, `fadeInDownBig`, `fadeInLeft`, `fadeInLeftBig`, `fadeInRight`, `fadeInRightBig`, `fadeInTopLeft`, `fadeInTopRight`, `fadeInUp`, `fadeInUpBig` |
| **Fading Exits** | `fadeOut`, `fadeOutBottomLeft`, `fadeOutBottomRight`, `fadeOutDown`, `fadeOutDownBig`, `fadeOutLeft`, `fadeOutLeftBig`, `fadeOutRight`, `fadeOutRightBig`, `fadeOutTopLeft`, `fadeOutTopRight`, `fadeOutUp`, `fadeOutUpBig` |
| **Flippers** | `flip`, `flipInX`, `flipInY`, `flipOutX`, `flipOutY` |
| **Lightspeed** | `lightSpeedInLeft`, `lightSpeedInRight`, `lightSpeedOutLeft`, `lightSpeedOutRight` |
| **Rotating Entrances** | `rotateIn`, `rotateInDownLeft`, `rotateInDownRight`, `rotateInUpLeft`, `rotateInUpRight` |
| **Rotating Exits** | `rotateOut`, `rotateOutDownLeft`, `rotateOutDownRight`, `rotateOutUpLeft`, `rotateOutUpRight` |
| **Sliding Entrances** | `slideInDown`, `slideInLeft`, `slideInRight`, `slideInUp` |
| **Sliding Exits** | `slideOutDown`, `slideOutLeft`, `slideOutRight`, `slideOutUp` |
| **Zoom Entrances** | `zoomIn`, `zoomInDown`, `zoomInLeft`, `zoomInRight`, `zoomInUp` |
| **Zoom Exits** | `zoomOut`, `zoomOutDown`, `zoomOutLeft`, `zoomOutRight`, `zoomOutUp` |
| **Specials** | `hinge`, `jackInTheBox`, `rollIn`, `rollOut` |

## Accessibility

This module is designed for WCAG 2.1 AA conformance.

| Criterion | Implementation |
|-----------|---------------|
| **1.3.1 Info and Relationships** | Wrapper starts `inert` + `aria-hidden="true"` + `visibility:hidden` — hidden content is not reachable by keyboard or announced by screen readers before it appears |
| **2.1.1 Keyboard** | `inert` attribute suppresses keyboard focus into the hidden wrapper in all browsers; removed on reveal |
| **2.2.2 Pause, Stop, Hide** | Looping animations (`iterationCount > 1`) expose a native `<button>` pause control with `aria-pressed` state |
| **2.3.3 Animation from Interactions** | `prefers-reduced-motion: reduce` is detected via `matchMedia`; animation classes are not applied and JS delays are skipped |
| **2.4.3 Focus Order** | Exit animations (names ending in `Out`, or `hinge`) move keyboard focus to the next sibling before hiding the element on `animationend` |
| **4.1.1 Parsing** | Animation class names and iteration counts are validated against an allowlist regex before being injected into the DOM |
| **4.1.2 Name, Role, Value** | Pause button uses native `<button>` with `aria-pressed` reflecting current state; label changes between "Pause animation" and "Resume animation" |

## Architecture

```
src/
├── main/
│   ├── java/org/jahia/modules/filter/
│   │   └── AnimateFilter.java          # OSGi RenderFilter — pushes the animate wrapper
│   └── resources/
│       ├── META-INF/
│       │   └── definitions.cnd         # jmix:animate mixin definition
│       ├── jmix_animate/html/
│       │   ├── animate.animate.jsp     # Wrapper view — IntersectionObserver + animation logic
│       │   └── animate.animate.properties  # View metadata (type=skin)
│       └── resources/
│           └── animate.properties      # i18n labels for all 94 animations
```

### How the render filter works

`AnimateFilter` is an OSGi `RenderFilter` registered at priority 46. It fires only on nodes that have the `jmix:animate` mixin (`applyOnNodeTypes = jmix:animate`). When the node has a `j:animation` property, the filter calls `resource.pushWrapper("animate")`, which causes Jahia to render the node inside `animate.animate.jsp` instead of its own view.

The filter skips:
- `include` and `wrapper` configurations (prevents double-wrapping)
- `studio` mode

### CSS delivery

animate.css is fetched via npm during the Maven build (`frontend-maven-plugin` + `npm install`). A post-install script (`copy-animate.js`) minifies `animate.compat.css` using `clean-css` and writes the result to `src/main/resources/css/animate.min.css`, where it is picked up by the Maven resources plugin and bundled into the JAR.

In live mode, Jahia aggregates all CSS resources into a single bundle (`/generated-resources/{hash}.min.css`). The animate.css rules are delivered as part of this bundle.

## Development

### Build

```bash
mvn clean install
```

This installs Node 20.x and runs `npm install` (which triggers the `copy-animate.js` postinstall script to produce `animate.min.css`) before compiling the Java sources and packaging the OSGi bundle.

### Deploy to a local Jahia instance

```bash
mvn clean install jahia:deploy
```

### Update animate.css

animate.css is pinned to `4.1.1` in `package.json`. To upgrade:

1. Update the version in `package.json`
2. Run `mvn clean install` — the postinstall script copies the new CSS
3. Update `definitions.cnd` if any animation class names changed
4. Update `src/main/resources/resources/animate.properties` with new labels

### Running the Cypress tests

```bash
cd tests
yarn install
yarn e2e:ci
```

See [`tests/README.md`](tests/README.md) for full test documentation.

## Contributing

Pull requests are welcome. Please ensure:
- WCAG 2.1 AA compliance is maintained
- New animations are added to both `definitions.cnd` and `animate.properties`
- Tests pass: `cd tests && yarn e2e:ci`

## Release

This module uses the Maven Release Plugin with the `@{project.version}` tag name format.

```bash
mvn release:prepare release:perform
```

## License

MIT — see [LICENSE.txt](LICENSE.txt).

## Links

- [animate.css](https://animate.style/) — animation library
- [Jahia Community](https://community.jahia.com)
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/)
