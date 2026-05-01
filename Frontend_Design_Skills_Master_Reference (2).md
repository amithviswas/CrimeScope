# 🎨 Frontend Design & Animation Skills — Master Reference
> Compiled from: `claude-brand-skills-master`, `claudedesignskills-main`, `unlimited-claude-AI`, `claude-code-main`, `frontend-design-main`, `ai-frontend-design-kit-main`, `website_designs-main`, `100-Days-of-Design-Engineering-main`, `fumeng-main`, `ai-ui-design-skills-main`, `awesome-claude-skills-master`, `frontend-design-main_2`

---

## 📋 TABLE OF CONTENTS

**Part A — Design Philosophy & Foundations**
1. [Frontend Design Philosophy (Brand Skills)](#1-frontend-design-philosophy)
2. [Frontend Design — The Eight Anchors System](#2-frontend-design--the-eight-anchors-system) ⭐ NEW
3. [Anti-Slop Gate — 10 Visual Red Lines](#3-anti-slop-gate--10-visual-red-lines) ⭐ NEW
4. [Brand Identity System](#4-brand-identity-system)
5. [Canvas & Visual Art Design](#5-canvas--visual-art-design)

**Part B — Modern Web Design & Research**
6. [Modern Web Design (2024–2025)](#6-modern-web-design-20242025)
7. [AI Frontend Design Kit — Full 7-Phase Workflow](#7-ai-frontend-design-kit--full-7-phase-workflow) ⭐ NEW
8. [Frontend Design Research (Six Dimensions)](#8-frontend-design-research-six-dimensions) ⭐ NEW
9. [Frontend Interview Dualround](#9-frontend-interview-dualround) ⭐ NEW
10. [Frontend Visual Reference (Moodboard + Mockup + Motion)](#10-frontend-visual-reference-moodboard--mockup--motion) ⭐ NEW
11. [Frontend Design Writer (design.md)](#11-frontend-design-writer-designmd) ⭐ NEW
12. [Frontend Motion Prompt Writer](#12-frontend-motion-prompt-writer) ⭐ NEW
13. [Frontend Design Review](#13-frontend-design-review) ⭐ NEW
14. [Frontend Iteration Planner](#14-frontend-iteration-planner) ⭐ NEW
15. [Frontend i18n Essentials](#15-frontend-i18n-essentials) ⭐ NEW
16. [System Design Skill](#16-system-design-skill) ⭐ NEW

**Part C — Animation & 3D Libraries**
17. [GSAP & ScrollTrigger Animations](#17-gsap--scrolltrigger-animations)
18. [Framer Motion / Motion Library](#18-framer-motion--motion-library)
19. [Three.js WebGL/WebGPU](#19-threejs-webglwebgpu)
20. [React Three Fiber (R3F)](#20-react-three-fiber-r3f)
21. [Anime.js](#21-animejs)
22. [Lottie Animations](#22-lottie-animations)
23. [Scroll Reveal (AOS)](#23-scroll-reveal-aos)
24. [Animated Component Libraries (Magic UI & React Bits)](#24-animated-component-libraries-magic-ui--react-bits)

**Part D — 314 Web Design Aesthetics Library**
25. [Website Design Styles — Complete Reference](#25-website-design-styles--complete-reference) ⭐ NEW

**Part E — Tools & Projects**
26. [100 Days of Design Engineering](#26-100-days-of-design-engineering) ⭐ NEW
27. [Unlimited Claude Self-Hosted Interface](#27-unlimited-claude-self-hosted-interface)
28. [Claude Code (Agentic Coding Tool)](#28-claude-code-agentic-coding-tool)
29. [Quick Decision Guide — Which Tool to Use?](#29-quick-decision-guide--which-tool-to-use)

**Part F — AI Image-to-UI & Advanced Prompting**
30. [Fumeng — AI Image Frontend UI (INTP Triforce)](#30-fumeng--ai-image-frontend-ui-intp-triforce) ⭐ NEW
31. [9 Aesthetic Families for UI Generation](#31-9-aesthetic-families-for-ui-generation) ⭐ NEW
32. [Frontend Design v2 — Aesthetic Directions & References](#32-frontend-design-v2--aesthetic-directions--references) ⭐ NEW
33. [Animation Patterns Library](#33-animation-patterns-library) ⭐ NEW
34. [Typography Mastery](#34-typography-mastery) ⭐ NEW

**Part G — SaaS Product UI System**
35. [SaaS Product UI System](#35-saas-product-ui-system) ⭐ NEW
36. [SaaS Page Blueprints](#36-saas-page-blueprints) ⭐ NEW
37. [SaaS Typography System](#37-saas-typography-system) ⭐ NEW
38. [Image, Logo & Icon Generation](#38-image-logo--icon-generation) ⭐ NEW

**Part H — Awesome Claude Skills (Utilities)**
39. [Artifacts Builder (React + shadcn/ui)](#39-artifacts-builder-react--shadcnui) ⭐ NEW
40. [Theme Factory — 10 Pre-Set Themes](#40-theme-factory--10-pre-set-themes) ⭐ NEW
41. [Brand Guidelines (Anthropic)](#41-brand-guidelines-anthropic) ⭐ NEW
42. [Image Enhancer](#42-image-enhancer) ⭐ NEW
43. [Web App Testing (Playwright)](#43-web-app-testing-playwright) ⭐ NEW

---

## 1. Frontend Design Philosophy

> **Skill:** `frontend-design` | Source: `claude-brand-skills-master`

### The Core Problem: LLMs Converge to the Mean

When generating design, AI predicts the most probable next token — meaning **every design choice gravitates toward the statistical average of "good design."** The result: competent, polished, generic work.

**Why this happens:**
- AI cannot *see* what it produces. It writes HTML/CSS as text tokens with no visual feedback.
- It optimizes for coherence. "Broken" or rule-breaking design goes against its training weights.
- It cannot feel tension. Great experimental design creates productive discomfort — AI can't calibrate this.
- It has no taste. Taste is judgment not reducible to rules.

### What This Means for You (the User)

**Your direction and reference material are the design.** The AI is the hand; you are the eye.

Provide:
- **Reference images or sites** — especially from outside your industry. A restaurant menu layout applied to a fintech page is more distinctive than any "experimental fintech" prompt.
- **What you hate**, not just what you want. "I hate card grids" is more useful than "make it interesting."
- **Multiple feedback rounds.** The first output will always be the most average. Each "kill this, keep that" round moves away from the center.
- **Bold kills.** If a variant feels safe or familiar — that means it is. Discomfort with a variant often signals it's genuinely distinctive.

### The Process That Works

**Do NOT treat this as single-pass (brief → design → done).** That guarantees convergence.

| Step | Action |
|------|--------|
| **Diverge** | Generate 3–5 structurally different variants. Not color/font swaps — fundamentally different spatial logic, rhythm, composition. Each variant explicitly names what design convention it's "fighting." |
| **Kill** | Make binary decisions: alive or dead. No blending — blending is averaging. |
| **Mutate** | Within the surviving direction, introduce deliberate "breaks" — named violations of design convention. Pick which breaks work. |
| **Repeat** | Each cycle moves further from the center. Your selections are the creative act. |

Deploy variants to a comparison page so you can see them side by side — visual comparison is the only honest evaluation.

---

### Design Thinking Before Coding

Before any code, commit to a **BOLD aesthetic direction**:

| Question | What to Ask |
|----------|-------------|
| **Purpose** | What problem does this interface solve? Who uses it? |
| **Tone** | Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian |
| **Differentiation** | What makes this *unforgettable*? What's the one thing someone will remember? |
| **References** | Non-digital references (architecture, print, film, physical objects) are more valuable than verbal briefs. |

---

### Frontend Aesthetics Guidelines

#### Typography
- Choose fonts that are **beautiful, unique, and interesting**
- Avoid generic fonts: Arial, Inter, Roboto, system fonts
- Opt for distinctive choices: pair a display font with a refined body font
- Unexpected, characterful font choices elevate aesthetics

#### Color & Theme
- Commit to a **cohesive aesthetic**
- Use CSS variables for consistency
- Dominant colors with sharp accents outperform timid, evenly-distributed palettes
- **Never:** overused purple gradients on white backgrounds

#### Motion
- Use animations for effects and micro-interactions
- CSS-only solutions for HTML; Motion library for React
- Focus on high-impact moments: one well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions
- Scroll-triggering and hover states that surprise

#### Spatial Composition
- Unexpected layouts — Asymmetry — Overlap — Diagonal flow
- Grid-breaking elements
- Generous negative space OR controlled density

#### Backgrounds & Visual Details
- Create atmosphere and depth (not solid color defaults)
- Gradient meshes, noise textures, geometric patterns, layered transparencies
- Dramatic shadows, decorative borders, custom cursors, grain overlays

---

## 4. Brand Identity System

> **Skill:** `brand-skill` | Source: `claude-brand-skills-master`

### What Makes Brand Work Distinctive (Anti-AI-Slop)

- **Emotionally grounded** — every visual choice connects to human meaning
- **Systematically distinctive** — coherent systems, not random "modern" aesthetics
- **Intentionally crafted** — expert-level refinement, not first-draft defaults

The secret: Start with **emotive narrative before any visual work.** This creates deep context that prevents generic drift.

---

### The 8-Phase Brand Process

#### Phase 0: Emotive Narrative ⭐ (Do First)
Create the *soul* before the visuals. Output: 4–6 paragraph narrative covering:
- The human moment (why this matters)
- The transformation (what becomes possible)
- The ethos (values and principles)
- The personality (how it moves through the world)
- The north star (guiding light for all decisions)

**Why first:** Grounds all subsequent choices in human meaning. Prevents generic "clean and modern" drift.

#### Phase 1: Discovery
Strategy and positioning — understand the landscape before designing.

#### Phase 2: Visual Direction
Reference exploration. Find what exists and how to diverge from it.

#### Phase 3: Mark Development
Logo via tracing or hand-coding. SVG-based, not raster.

#### Phase 4: Wordmark
Typography and lockups — the verbal identity made visual.

#### Phase 5: Design System
Complete system covering web + iOS specifications.

#### Phase 5A: Composition Identity
Evolutionary diverge/kill/mutate process (same as frontend design philosophy).

#### Phase 6: Design.md Creation
Consolidate everything to a single `DESIGN.md` reference file.

#### Phase 7: Packaging
Final delivery — organized, handoff-ready.

---

### Brand Skill Folder Structure

```
brand-skill/
├── SKILL.md                      # Overview and routing
├── TOOLS-REQUIRED.md             # Prerequisites checklist
├── ADDENDUM-4-WEB-PRESENCE.md    # Convergence theory
├── SKILL-AUDIT.md                # Gap analysis
├── Workflows/
│   ├── 00-EmotiveNarrative.md    # Soul of the brand
│   ├── 01-Discovery.md
│   ├── 02-VisualDirection.md
│   ├── 03-MarkDevelopment.md
│   ├── 04-Wordmark.md
│   ├── 05-DesignSystem.md
│   ├── 05A-CompositionIdentity.md
│   ├── 06-DesignMdCreation.md
│   └── 07-Packaging.md
├── Templates/
│   ├── DESIGN-template.md
│   ├── philosophy-template.md
│   ├── visual-philosophy-template.md
│   ├── design-guidelines-template.md
│   └── readme-template.md
└── Examples/
    └── sorted-brand-kit/          # Real-world example
```

---

## 5. Canvas & Visual Art Design

> **Skill:** `canvas-design` | Source: `claude-brand-skills-master`

### What This Is
Creating beautiful visual art in `.png` and `.pdf` documents using design philosophy. Use when creating: **posters, artwork, designs, or other static visual pieces.**

### Two-Step Process

**Step 1: Design Philosophy Creation** (`.md` file)
Write a VISUAL PHILOSOPHY — not layouts or templates — that will be interpreted through:
- Form, space, color, composition
- Images, graphics, shapes, patterns
- Minimal text as visual accent

**Step 2: Express on Canvas** (`.pdf` or `.png` file)
The philosophy is expressed visually — 90% visual design, 10% essential text.

---

### How to Generate a Visual Philosophy

**Name the movement** (1–2 words): e.g., "Brutalist Joy" / "Chromatic Silence" / "Metabolist Dreams"

**Articulate the philosophy** (4–6 substantial paragraphs):

Capture the visual essence through:
- Space and form
- Color and material
- Scale and rhythm
- Composition and balance
- Visual hierarchy

**Critical guidelines:**
- Avoid redundancy — each design aspect mentioned once
- Emphasize craftsmanship repeatedly: "meticulously crafted," "painstaking attention," "master-level execution"
- Leave creative space — specific enough for direction, concise enough for interpretation

### Philosophy Examples

| Name | Philosophy | Visual Expression |
|------|------------|-------------------|
| **Concrete Poetry** | Communication through monumental form and bold geometry | Massive color blocks, sculptural typography, Brutalist spatial divisions, Polish poster energy meets Le Corbusier |
| **Chromatic Language** | Color as the primary information system | Geometric precision where color zones create meaning. Typography minimal — small sans-serif labels. Josef Albers meets data visualization |
| **Analog Meditation** | Quiet visual contemplation through texture and breathing room | Paper grain, ink bleeds, vast negative space. Japanese photobook aesthetic |
| **Organic Systems** | Natural clustering and modular growth patterns | Rounded forms, organic arrangements, color from nature through architecture |
| **Geometric Silence** | Pure order and restraint | Grid-based precision, bold photography, dramatic negative space. Swiss formalism meets Brutalist material honesty |

---

## 6. Modern Web Design (2024–2025)

> **Skill:** `modern-web-design` | Source: `claudedesignskills-main`

### Core Design Principles

#### 1. Performance-First Design

Target Core Web Vitals:

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| INP (Interaction to Next Paint) | < 200ms |

Implementation:
- Defer non-critical animations until after page load
- Use CSS `transform` / `opacity` (GPU-accelerated)
- Implement lazy loading for images, videos, 3D content
- Progressive enhancement: core content works without JavaScript

#### 2. Bold Minimalism

- Large, impactful typography (`clamp()` for fluid sizing)
- Ample white space (negative space as design element)
- Limited color palettes (3–5 primary colors)
- Intentional bold accent colors
- Geometric shapes and clean lines

**Fluid Typography System:**
```css
--font-size-xs:   clamp(0.75rem,  0.7rem  + 0.25vw, 0.875rem);
--font-size-sm:   clamp(0.875rem, 0.8rem  + 0.375vw, 1rem);
--font-size-base: clamp(1rem,     0.9rem  + 0.5vw,   1.25rem);
--font-size-lg:   clamp(1.25rem,  1.1rem  + 0.75vw,  1.75rem);
--font-size-xl:   clamp(1.75rem,  1.5rem  + 1.25vw,  2.5rem);
--font-size-2xl:  clamp(2.5rem,   2rem    + 2.5vw,   4rem);
--font-size-3xl:  clamp(3.5rem,   2.5rem  + 5vw,     6rem);
```

**Accessibility-First Color System:**
```css
--color-primary:     oklch(50% 0.2 250);  /* Blue */
--color-accent:      oklch(65% 0.25 30);  /* Coral */
--color-neutral-50:  oklch(98% 0 0);
--color-neutral-900: oklch(20% 0 0);
/* Minimum contrast ratio: 7:1 for text (WCAG AAA) */
```

#### 3. Micro-Interactions

| Category | What it Does | Example |
|----------|-------------|---------|
| Hover States | Scale, color, shadow, cursor | Scale to 1.05–1.1x |
| Loading States | Skeleton screens, blur-up images | Better than spinners |
| Interactive Feedback | Press states, toggle switches, form validation | Scale down 0.95x on press |

**Example with Framer Motion:**
```jsx
<motion.button
  whileHover={{ scale: 1.05, y: -2 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Click me
</motion.button>
```

---

## 17. GSAP & ScrollTrigger Animations

> **Skill:** `gsap-scrolltrigger` | Source: `claudedesignskills-main`

### What GSAP Is
GSAP (GreenSock Animation Platform) is the industry-leading JavaScript animation library for high-performance, production-quality animations. ScrollTrigger is its plugin for scroll-driven animations.

**Use when:** Web animations, scroll-driven experiences, timelines, tweens, scroll-triggered animations, pinning, scrubbing, parallax, DOM/SVG/Canvas/WebGL animation.

### Core Concepts

#### Tweens (Single Animation)
```javascript
// Animate TO a state
gsap.to(".box", { x: 200, rotation: 360, duration: 1, ease: "power2.inOut" });

// Animate FROM a state
gsap.from(".box", { opacity: 0, y: -50, duration: 0.8 });

// Animate FROM-TO (both start and end)
gsap.fromTo(".box",
  { opacity: 0, scale: 0.5 },        // FROM
  { opacity: 1, scale: 1, duration: 1 } // TO
);
```

#### Timelines (Sequencing)
```javascript
const tl = gsap.timeline();

tl.to(".box1", { x: 100, duration: 1 })
  .to(".box2", { y: 100, duration: 1 })
  .to(".box3", { rotation: 360, duration: 1 });

// With labels for precision
tl.addLabel("reveal")
  .to(".hero",    { opacity: 1, duration: 1 })
  .to(".content", { y: 0, duration: 0.8 }, "reveal")       // Start at label
  .to(".cta",     { scale: 1, duration: 0.5 }, "reveal+=0.5"); // 0.5s after label
```

#### ScrollTrigger
```javascript
gsap.to(".element", {
  scrollTrigger: {
    trigger: ".element",
    start: "top 80%",    // When top of element hits 80% from top of viewport
    end: "bottom 20%",
    scrub: true,         // Animate in sync with scroll
    pin: true,           // Pin element during animation
    markers: true        // Debug markers (remove in production)
  },
  x: 500,
  opacity: 0
});
```

### Key Features Summary

| Feature | Use Case |
|---------|----------|
| `gsap.to()` | Animate to a target state |
| `gsap.from()` | Animate from a starting state |
| `gsap.fromTo()` | Define both start and end |
| `gsap.timeline()` | Sequence multiple animations |
| `ScrollTrigger` | Scroll-driven animations |
| `scrub` | Sync animation speed to scroll speed |
| `pin` | Pin element during scroll animation |
| `stagger` | Delay between multiple element animations |

---

## 18. Framer Motion / Motion Library

> **Skill:** `motion-framer` | Source: `claudedesignskills-main`

### What It Is
Motion (formerly Framer Motion) is a production-ready animation library for React and JavaScript with declarative, performant animations.

**Use when:** Interactive UI components, micro-interactions, page transitions, scroll-based animations, layout animations, drag-and-drop, complex animation sequences.

### Core Concepts

#### Motion Components
Convert any HTML/SVG element by prefixing with `motion.`:
```jsx
import { motion } from "framer-motion"

<motion.div />
<motion.button />
<motion.svg />
<motion.path />
```

#### Animate Prop
```jsx
// Simple — x position changes
<motion.div animate={{ x: 100 }} />

// Multiple properties
<motion.div animate={{ x: 100, opacity: 1, scale: 1.2 }} />

// Reacts to state changes
const [isOpen, setIsOpen] = useState(false)
<motion.div animate={{ width: isOpen ? 300 : 100 }} />
```

#### Variants (Named States)
```jsx
const variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
}

<motion.div variants={variants} initial="hidden" animate="visible">
  <motion.p variants={variants}>Child 1</motion.p>
  <motion.p variants={variants}>Child 2</motion.p>
</motion.div>
```

#### Gestures
```jsx
<motion.button
  whileHover={{ scale: 1.1, backgroundColor: "#ff0000" }}
  whileTap={{ scale: 0.9 }}
  drag
  dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
>
  Interactive Button
</motion.button>
```

#### Exit Animations (AnimatePresence)
```jsx
import { AnimatePresence, motion } from "framer-motion"

<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    />
  )}
</AnimatePresence>
```

### Feature Summary

| Feature | Description |
|---------|-------------|
| `motion.div` | Animatable HTML elements |
| `animate` | Target animation state |
| `initial` | Starting state |
| `exit` | Exit animation (with AnimatePresence) |
| `whileHover/Tap/Drag` | Gesture-based animations |
| `variants` | Named animation states |
| `transition` | Control duration, easing, spring |
| `layout` | Automatic layout change animations |
| `useScroll` | Scroll-based animations |

---

## 19. Three.js WebGL/WebGPU

> **Skill:** `threejs-webgl` | Source: `claudedesignskills-main`

### What It Is
Three.js is the industry-standard JavaScript library for 3D graphics in browsers using WebGL and WebGPU.

**Use when:** Interactive 3D scenes, product configurators, 3D visualizations, immersive web experiences, WebGL/WebGPU rendering.

### Scene Graph Architecture

```
Scene
├── Camera
├── Lights
│   ├── AmbientLight
│   ├── DirectionalLight
│   └── PointLight
├── Meshes
│   ├── Mesh (Geometry + Material)
│   └── InstancedMesh
└── Groups
```

### Essential Components

| Component | Purpose |
|-----------|---------|
| **Scene** | Container for all 3D objects |
| **Camera** | Defines the viewing perspective |
| **Renderer** | Draws the scene to canvas |
| **Geometry** | Defines the shape of objects |
| **Material** | Defines surface appearance |
| **Mesh** | Combines geometry + material |

### Basic Scene Setup
```javascript
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Scene, Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Geometry + Material + Mesh
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  controls.update();
  renderer.render(scene, camera);
}
animate();
```

---

## 20. React Three Fiber (R3F)

> **Skill:** `react-three-fiber` | Source: `claudedesignskills-main`

### What It Is
R3F is a React renderer for Three.js — declarative, component-based 3D development in React.

**Use when:** 3D experiences within React apps, product configurators, 3D portfolios, games in React, adding 3D to existing React projects.

**Key Benefits:**
- Declarative: Write 3D scenes like React components
- Full React hooks, context, state management
- Works with Drei helpers, Zustand, Framer Motion
- Full TypeScript support

### Canvas Component
```jsx
import { Canvas } from '@react-three/fiber'

function App() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
    >
      {/* 3D content here */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </Canvas>
  )
}
```

### Three.js vs React Three Fiber

| Feature | Three.js (imperative) | R3F (declarative) |
|---------|----------------------|-------------------|
| Syntax | `new THREE.Mesh()` | `<mesh>` |
| State | Manual | React hooks |
| Reusability | Manual | React components |
| React integration | Manual | Native |

---

## 21. Anime.js

> **Skill:** `animejs` | Source: `claudedesignskills-main`

### What It Is
Lightweight (~9KB gzipped) JavaScript animation engine for DOM, CSS, SVG, and JavaScript objects.

**Use when:** Timeline-based animations, stagger effects, SVG morphing, keyframe sequences, framework-agnostic animation, SVG-heavy animations.

**Use instead of GSAP when:** Project is React-independent or SVG-heavy. Use GSAP for complex scroll experiences.

### Core Usage
```javascript
import anime from 'animejs'

// Basic animation
anime({
  targets: '.element',
  translateX: 250,
  rotate: '1turn',
  duration: 800,
  easing: 'easeInOutQuad'
})

// Stagger (multiple elements)
anime({
  targets: '.item',
  translateY: [-20, 0],
  opacity: [0, 1],
  delay: anime.stagger(100),  // 100ms delay between each element
  duration: 600
})

// SVG Path Drawing
anime({
  targets: 'path',
  strokeDashoffset: [anime.setDashoffset, 0],
  duration: 2000,
  easing: 'easeInOutSine'
})

// Timeline
const timeline = anime.timeline({ easing: 'easeOutExpo', duration: 750 })
timeline
  .add({ targets: '.box1', translateX: 250 })
  .add({ targets: '.box2', translateX: 250 }, '-=500')  // Start 500ms before box1 ends
  .add({ targets: '.box3', translateX: 250 }, '-=500')
```

### Features Summary

| Feature | Description |
|---------|-------------|
| `anime()` | Core animation function |
| `targets` | CSS selectors, DOM elements, JavaScript objects |
| `stagger()` | Delay between multiple element animations |
| `timeline()` | Sequence animations with precise offsets |
| SVG morphing | Morph SVG shapes between keyframes |
| Path drawing | Animate SVG stroke-dashoffset |
| Spring easing | Physics-based easing |

---

## 22. Lottie Animations

> **Skill:** `lottie-animations` | Source: `claudedesignskills-main`

### What It Is
Library for rendering After Effects animations in real-time on web. Animations are exported from After Effects as JSON using the Bodymovin plugin.

**Use when:** Designer-created animations needing pixel-perfect fidelity, animated icons, loading animations, onboarding sequences, marketing animations.

**Key advantages:** Vector-based (infinitely scalable), smaller than GIF/video, editable at runtime, cross-platform consistent.

### Format Types

| Format | Description | File Size |
|--------|-------------|-----------|
| **JSON Lottie (.json)** | Original format, human-readable | Larger |
| **dotLottie (.lottie)** | Modern compressed ZIP format, supports multiple animations | Up to 90% smaller ✅ Recommended |

### Implementation

**lottie-web (vanilla JS):**
```javascript
import lottie from 'lottie-web';

const animation = lottie.loadAnimation({
  container: document.getElementById('animation'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: '/animations/my-animation.json'
});

// Controls
animation.play();
animation.pause();
animation.stop();
animation.setSpeed(1.5);
animation.setDirection(-1);  // Reverse

// Play specific segment
animation.playSegments([0, 30], true);
```

**lottie-react:**
```jsx
import Lottie from 'lottie-react';
import animationData from './animation.json';

<Lottie
  animationData={animationData}
  loop={true}
  autoplay={true}
  style={{ width: 300, height: 300 }}
/>
```

---

## 23. Scroll Reveal (AOS)

> **Skill:** `scroll-reveal-libraries` | Source: `claudedesignskills-main`

### What It Is
AOS (Animate On Scroll) — lightweight CSS-driven library for scroll-triggered animations. 50+ built-in animations (fades, slides, zooms, flips).

**Use when:** Marketing/landing pages, content-heavy sites, quick prototypes, simple scroll effects.

**Don't use when:** Complex timelines → use GSAP; physics-based → use React Spring/Framer Motion; precise scroll-sync → use GSAP ScrollTrigger.

### Installation

**CDN:**
```html
<head>
  <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
</head>
<body>
  <script src="https://unpkg.com/aos@next/dist/aos.js"></script>
  <script>AOS.init();</script>
</body>
```

**NPM:**
```bash
npm install aos
```

### Usage
```html
<!-- Data attribute API — configure in HTML -->
<div data-aos="fade-up">Fade up on scroll</div>
<div data-aos="slide-left" data-aos-delay="200">Slide from right</div>
<div data-aos="zoom-in" data-aos-duration="1000">Zoom in slowly</div>
<div data-aos="flip-left" data-aos-offset="300">Flip when 300px from viewport</div>
```

**Initialize with options:**
```javascript
AOS.init({
  duration: 800,   // Animation duration (ms)
  easing: 'ease',  // Easing function
  once: true,      // Only animate once (recommended for performance)
  offset: 100,     // Offset from viewport edge to trigger
  delay: 0,        // Global delay
});
```

### Available Animations

| Category | Animations |
|----------|-----------|
| Fade | `fade`, `fade-up`, `fade-down`, `fade-left`, `fade-right`, `fade-up-right`, `fade-up-left`, `fade-down-right`, `fade-down-left` |
| Flip | `flip-up`, `flip-down`, `flip-left`, `flip-right` |
| Slide | `slide-up`, `slide-down`, `slide-left`, `slide-right` |
| Zoom | `zoom-in`, `zoom-in-up`, `zoom-in-down`, `zoom-in-left`, `zoom-in-right`, `zoom-out` |

---

## 24. Animated Component Libraries (Magic UI & React Bits)

> **Skill:** `animated-component-libraries` | Source: `claudedesignskills-main`

### Magic UI

150+ TypeScript components built on Tailwind CSS + Framer Motion, designed for shadcn/ui integration. Copy-paste ready.

**Installation:**
```bash
# Via shadcn CLI (recommended)
npx shadcn@latest add https://magicui.design/r/animated-beam

# Manual
# 1. Copy component to components/ui/
# 2. npm install motion
# 3. Add required CSS animations to globals.css
# 4. Ensure cn() utility exists in lib/utils.ts
```

**Component Structure:**
```typescript
import { cn } from "@/lib/utils"
import { motion } from "motion/react"

interface ComponentProps extends React.ComponentPropsWithoutRef<"div"> {
  customProp?: string
  className?: string
}

export function Component({ customProp, className, ...props }: ComponentProps) {
  return (
    <motion.div
      className={cn("base-classes", className)}
      whileHover={{ scale: 1.05 }}
      {...props}
    />
  )
}
```

### React Bits

90+ animated React components with minimal dependencies. Focus on visual effects, backgrounds, and micro-interactions.

### When to Use Which

| Library | Best For |
|---------|---------|
| **Magic UI** | Landing pages, dashboards, shadcn/ui integration |
| **React Bits** | Visual effects, backgrounds, minimal-dependency projects |
| **GSAP** | Complex scroll animations, timeline sequences |
| **Framer Motion** | Interactive UI components, physics-based animations |
| **AOS** | Simple scroll reveals, marketing pages |

---

## 27. Unlimited Claude Self-Hosted Interface

> **Source:** `unlimited-claude-AI-main`

### What It Is
A fully functional, polished, self-hosted web interface for Claude AI. Runs entirely in-browser using **Puter.js** (free tier) for secure Claude API access.

**Key point:** Uses the official, legitimate Puter.js library — not a pirated or reverse-engineered API. Authentication links to your own Puter account's free Claude access.

### Features
- ✅ **100% Free Access** via Puter.js free tier
- 🎨 **Polished UI** with light and dark mode
- 📄 **Artifact Generation** — renders code into interactive canvases with syntax highlighting, copy, download, HTML preview
- 💬 **Streaming Responses** in real-time
- 📂 **Local Chat History** in browser's localStorage
- 🔐 **Secure Authentication** via Puter.js

### Tech Stack
- Core: Vanilla JavaScript (ES6+), HTML5, CSS3
- API: Puter.js SDK (`@puter.com/v2`)
- No frameworks required

### How to Run

**Windows (easiest):**
1. Download ZIP and extract
2. Double-click `run_server.bat`
3. Browser opens automatically to `http://localhost:8000`

**Mac / Linux:**
```bash
cd "unlimited claude"
python -m http.server 8000
# Open http://localhost:8000
```

**Requires only:** Python 3 (for the local server) + a modern browser. No pip packages needed.

**First use:** Allow the Puter.js popup for authentication.

---

## 28. Claude Code (Agentic Coding Tool)

> **Source:** `claude-code-main`

### What It Is
Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster through natural language commands.

**Works via:** Terminal, IDE, GitHub (tag `@claude` on issues/PRs)

### Installation

**macOS / Linux (Recommended):**
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Homebrew:**
```bash
brew install --cask claude-code
```

**Windows (Recommended):**
```powershell
irm https://claude.ai/install.ps1 | iex
```

**WinGet:**
```powershell
winget install Anthropic.ClaudeCode
```

**NPM (Deprecated — use above instead):**
```bash
npm install -g @anthropic-ai/claude-code
```

### Getting Started
```bash
cd your-project
claude
```

### Built-in Commands
| Command | Description |
|---------|-------------|
| `claude` | Start interactive session |
| `/bug` | Report a bug directly to Anthropic |

### Key Capabilities
- Execute routine coding tasks via natural language
- Explain complex code
- Handle git workflows
- Triage GitHub issues
- Deduplicate issues
- Auto-commit, push, create PRs

### Plugins
Extends functionality via custom commands and agents. See the `plugins/` directory in the repository.

### GitHub Workflows (from `.github/workflows/`)

| Workflow | Purpose |
|----------|---------|
| `claude.yml` | General Claude assistant on issues/PRs |
| `claude-dedupe-issues.yml` | Auto-detect duplicate issues |
| `claude-issue-triage.yml` | Auto-triage new issues |
| `auto-close-duplicates.yml` | Close confirmed duplicates |
| `lock-closed-issues.yml` | Lock closed issues after period |

---

## 29. Quick Decision Guide — Which Tool to Use?

### For Animations

| I want to... | Use |
|-------------|-----|
| Create scroll-driven, complex timeline animations | **GSAP + ScrollTrigger** |
| Add animations to React components with gestures | **Framer Motion** |
| Animate SVG paths, morphing, staggered sequences | **Anime.js** |
| Use designer-created After Effects animations | **Lottie** |
| Add simple scroll reveal to a marketing page | **AOS** |
| Use pre-built animated React components | **Magic UI / React Bits** |

### For 3D

| I want to... | Use |
|-------------|-----|
| Build a 3D scene in vanilla JavaScript | **Three.js** |
| Build a 3D scene inside a React app | **React Three Fiber (R3F)** |
| Create WebXR / VR / AR experiences | **A-Frame** |
| Build games or real-time 3D apps | **Babylon.js or PlayCanvas** |

### For Design Work

| I want to... | Use |
|-------------|-----|
| Build a production frontend UI | **Frontend Design Skill** |
| Create a full brand identity | **Brand Skill** |
| Create a poster / visual art / PNG/PDF | **Canvas Design Skill** |
| Follow modern web design standards | **Modern Web Design Skill** |

### For Claude Tools

| I want to... | Use |
|-------------|-----|
| Code faster in the terminal | **Claude Code** |
| Self-host a Claude chat UI for free | **Unlimited Claude Interface** |

---

## 📁 Source Files Reference

| Zip File | Contents |
|----------|---------|
| `claude-brand-skills-master.zip` | `frontend-design`, `brand-skill`, `canvas-design`, `art` skills |
| `claudedesignskills-main.zip` | 22 animation/3D skills: GSAP, Framer Motion, Three.js, R3F, Anime.js, Lottie, AOS, Magic UI, React Bits, BabylonJS, PixiJS, PlayCanvas, Barba.js, Spline, Rive, Blender pipeline, Locomotive Scroll, and more |
| `unlimited-claude-AI-main.zip` | Self-hosted Claude browser interface via Puter.js |
| `claude-code-main.zip` | Claude Code terminal tool source, plugins, GitHub workflow automations |

---

*Document compiled April 2026 from uploaded skill packages.*

---

## 2. Frontend Design — The Eight Anchors System

> **Skill:** `frontend-design` | Source: `frontend-design-main`

### What This Is
A precision system for making frontend visual design choices with deliberate intent. Instead of defaulting to generic styles, you **pick one of 8 anchors** — each is a distinct aesthetic territory locked to specific CSS tokens.

> *"Reach for the unexpected. Fidelity to the anchor. Discipline on the content. Nothing left to default."*

---

### The 5-Step Workflow (Before Writing Code)

| Step | What to Do |
|------|-----------|
| **1. Context** | Identify purpose, audience, domain, content density. State the problem in one sentence. |
| **2. Anchor** | Pick ONE. Lean unexpected. A Swiss punk record label, an Industrial florist, a Brutalist luxury watchmaker, an Aurora tax app — each more distinctive than its safe counterpart. |
| **3. Differentiator** | Define ONE memorable anchor-internal move: a signature interaction, typographic gesture, layout motif, or material treatment. One sentence. Visible in the rendered output. |
| **4. System** | Match the anchor's tokens exactly. Picking Swiss means white + sans + grid — not "some flavor of clean." |
| **5. Implementation** | Build. Every string on screen is authored content, not filler. |

**Critical rule:** Commit fully to ONE anchor. Hybridising ("Swiss with Brutalist edge") is a category error — each anchor's signature excludes the others by construction.

---

### Content Discipline — What's Forbidden

Design is visuals. Content (every string, number, label) is authored separately. **Token fidelity is not a defence against content slop.**

| Category | What's Forbidden |
|----------|-----------------|
| **Fabricated data** | Invented session personas (`a.chen@grid.co`), fake telemetry (`BUILD 8.2.0-rc3`). If no real content: leave it empty. |
| **Filler labels** | Mono-caps subtitles nobody asked for (`SECURE OPERATOR AUTHENTICATION`), `//`-prefixed kickers (`// INTELLIGENCE LAYER`). If removing it removes no information — it was filler. |
| **Themed UI copy** | `Authenticate Session` instead of `Next`. Standard copy for standard actions. |
| **Unicode glyph icons** | `▣ Dashboard`, `◊ Navigator`. Either use a real icon set or nothing. |
| **AI-slop register** | Twee subcopy on serious surfaces (`Ask the grid.`), synth-sci-fi status strips on mundane B2B. |

---

### The Eight Anchors (With CSS Token Specs)

#### 1. Swiss
- **Surface:** Pure white `#FFFFFF` or neutral `#F7F7F8`
- **Typography:** Akzidenz-Grotesk, Helvetica Neue, or Söhne — sans display and body, one family
- **Accent:** Swiss Red `#E4002B`, International Orange `#FF4F00`, or Yves Klein Blue `#002FA7` — one, used deliberately
- **Structure:** Visible grid lines or 1px hairline rules. Left-aligned typography; asymmetric balance. Numerals as composition elements.
- **Breaks if:** warm paper, serif display, grain texture, or centered typography appears.

#### 2. Industrial
- **Surface:** Pitch black `#000000` or warm-black `#0B0C0A`
- **Typography:** IBM Plex Mono, JetBrains Mono, or Berkeley Mono — mono for display and body
- **Signal color:** ONE semantic — green `#00E676`, red `#FF3B30`, amber `#FFB800`, or acid lime `#C6FF4A`
- **Structure:** Flat; 1px borders instead of shadows. `font-variant-numeric: tabular-nums`
- **Breaks if:** serif typography, proportional fonts, warm paper, grain, decorative shadows, or rounded corners appear.

#### 3. Brutalist
- **Surface:** Pure primary/anti-primary — `#FF0000`, `#0000FF`, `#FFFF00`, `#000000`, `#FFFFFF`. Pick 2–3, compete equally.
- **Typography:** System fonts only — Times New Roman, Helvetica, Courier, Arial, system-ui. Mix deliberately.
- **Shadows:** Hard offset, no blur — `box-shadow: 8px 8px 0 #000`
- **Controls:** Native browser — unstyled `<button>`, default `<select>`, underlined blue links.
- **Breaks if:** webfonts, soft shadows, rounded corners, or centered layout appear.

#### 4. Aurora Maximalism
- **Surface:** Dark saturated gradient — `linear-gradient` through violet `#5D34D0` → magenta `#FF006E` → cyan `#00F0FF`
- **Typography:** Inter Variable, PP Neue Machina, or Sharp Grotesk — oversized display (15–25vw)
- **Texture:** Mesh gradient as primary surface; neon `text-shadow` glow (`0 0 20px <accent>`)
- **Motion:** Spring-physics orchestration, scroll-linked parallax
- **Breaks if:** flat backgrounds, warm paper, restraint, or hairline rules as primary structure appear.

#### 5. Chaotic Maximalism
- **Surface:** Clashing palette — pastels AND neons. Hot pink `#FF71CE` + acid yellow `#DFFF00` + cyan `#00FFFF`
- **Typography:** 3+ faces from different registers on the same page
- **Texture:** Patterns on every surface (squiggles, dots, zigzags, checker — SVG or `repeating-linear-gradient`)
- **Breaks if:** coherent palette, single typeface, whitespace as structure, or 60/30/10 dominance appears.

#### 6. Retro-Futuristic
- **Surface:** Pitch black `#0A0014` or deep navy-black
- **Typography:** VT323 (CRT), Orbitron (synthwave), Space Mono (cyberpunk), Press Start 2P (arcade), IBM Plex Mono (terminal)
- **Accent:** Neon pair — magenta `#FF006E` + cyan `#00FFFF` (synthwave) OR phosphor green `#00FF41` + amber `#FFB000` (terminal)
- **Texture:** CRT scanlines via `::before repeating-linear-gradient`, chromatic aberration (`text-shadow: 2px 0 #FF0000, -2px 0 #00FFFF`)
- **Breaks if:** flatness, modern sans-serifs (Inter, Söhne), or paper surfaces appear.

#### 7. Organic
- **Surface:** Earth tones — sage `#8B9D83`, clay `#B08B6E`, terracotta `#C66B3D`, ochre `#C08E3A`, moss `#606C38`
- **Typography:** Humanist serif (Fraunces, Caslon, Freight) — *Fraunces restricted to this anchor only*
- **Structure:** Rounded corners 16–32px. Grain at 1–3% via SVG feTurbulence
- **Motion:** Gentle ease 300–500ms, breathing animations
- **Breaks if:** cream backgrounds (warm `#F0+`), cold greys, pure whites, pure blacks, or hard rectangles appear.

#### 8. Lo-Fi
- **Surface:** Paper-yellow `#E8E0C0` or `#EDE4CF` — more saturated than cream
- **Typography:** Mixed system fonts on same page (Times + Helvetica + Courier colliding deliberately)
- **Structure:** Rotated elements (2–8° off-grid via `transform: rotate`)
- **Texture:** Halftone dot transitions; Risograph misregistration (2–4px RGB channel offset: `text-shadow: 3px 0 #FF006E, -3px 0 #00FFCC`). SVG staple, tape, torn-edge elements.
- **Breaks if:** precision, single typeface, smooth motion, or squared rectangles appear.

---

### Pre-Ship Checklist

- [ ] **Unexpected pairing** — Did the choice create creative tension, or default to the safe pairing?
- [ ] **Token fidelity** — Does every rendered token live inside the anchor's allowed range?
- [ ] **Content discipline** — No fabrication, filler mono-caps, `//` kickers, unicode-glyph icons, AI-slop register?
- [ ] **Differentiator visible** — Is the memorable anchor-internal move actually rendered?
- [ ] **Hybrid resistance** — Was one anchor held, not drifted into "Swiss with Brutalist edge"?

---

## 3. Anti-Slop Gate — 10 Visual Red Lines

> **Skill:** `frontend-anti-slop-gate` | Source: `ai-frontend-design-kit-main`

### What This Is
A stateless mechanical gate that scans frontend code for 10 hard-coded visual "slop" patterns — the AI default tendencies that make UIs look generic. Run it before generating code and when reviewing code.

**This gate doesn't know your project. It has one job: code in → violations + fixes out.**

---

### The 10 Hard Prohibitions

#### Typography Layer
| # | Prohibition | Replace With |
|---|------------|--------------|
| 1 | **`font-inter`** (in premium contexts) | Geist, Outfit, Cabinet Grotesk, Satoshi, Switzer |
| 2 | **Generic serif** (Times/Georgia/Garamond) for dashboards | Fraunces, Instrument Serif, Newsreader; dashboards ban serifs |

#### Color Layer
| # | Prohibition | Replace With |
|---|------------|--------------|
| 3 | **Purple/blue AI gradient ("Lila Ban")** — `purple-600`, `indigo-500`, `from-purple-to-blue` | Zinc/Slate base + single high-contrast accent (Emerald / Electric Blue / Deep Rose), saturation < 80% |
| 4 | **Pure black `#000000`** | `#0a0a0a` / `#121212` / Zinc-950 / charcoal / deep navy |

#### Layout Layer
| # | Prohibition | Replace With |
|---|------------|--------------|
| 5 | **3 equal-width card columns** | 2-column Zig-Zag / asymmetric Grid (`2fr 1fr 1fr`) / horizontal scroll / masonry |
| 6 | **Centered symmetric Hero** (when variance > 4) | Split Screen / left-aligned text + right asset / asymmetric whitespace |
| 7 | **`h-screen`** | `min-h-[100dvh]` (fixes iOS Safari address bar jump) |

#### Asset Layer
| # | Prohibition | Replace With |
|---|------------|--------------|
| 8 | **Lucide/Feather icons exclusively** | Phosphor (Bold/Fill) / Heroicons / Radix UI Icons / custom set |
| 9 | **Generic placeholder data** | John Doe/Jane Smith → diverse realistic names; 99.99% → organic numbers (47.2%, $99.00); Acme/Nexus → invented credible brands; "Elevate/Seamless/Unleash/Next-Gen" → concrete verbs |

#### Code Layer
| # | Prohibition | Replace With |
|---|------------|--------------|
| 10 | **`window.addEventListener('scroll')` + `useState` continuous animation** | `IntersectionObserver` or Framer Motion `whileInView`; `useMotionValue` + `useTransform`; animate only `transform` and `opacity` (not `top`/`left`/`width`/`height`) |

---

### Secondary Prohibitions (Optional)
- Round loading spinner → skeleton screen matching layout
- Neon external glow → subtle inner shadow or micro `box-shadow`
- Custom mouse cursor → system default
- Labels like `SECTION 01` / `ABOUT US` → remove or replace
- "Scroll to explore" / bouncing chevron → let content naturally attract

---

### Output Format

```markdown
## Anti-slop Scan — [Date]

### P0 Violations (Must Fix)
- [ ] §1 Typography: Hero uses `font-inter` → change to `font-geist` or `font-cabinet-grotesk`
- [ ] §3 Color: `from-purple-600 to-indigo-500` gradient, violates Lila Ban → change to Zinc base + Emerald accent

### Project Exemptions (Recorded)
- §4 Color: Brutalist project requires pure black → prohibition 4 exempted

### Secondary Suggestions (Optional)
- CTA spinner is round → consider skeleton screen
```

---

## 7. AI Frontend Design Kit — Full 7-Phase Workflow

> **Source:** `ai-frontend-design-kit-main` | Skills: `frontend-design-research`, `frontend-interview-dualround`, `frontend-visual-reference`, `frontend-design-writer`, `frontend-motion-prompt-writer`, `frontend-design-review`, `frontend-iteration-planner`, `frontend-anti-slop-gate`, `frontend-i18n-essentials`, `system-design`

### The 7-Phase Frontend Design Process

```
Phase 1: Requirements + Front-Round Interview  → Main Language + Goal + Product Boundary
           ↓
Phase 2: Six-Dimension Reference Research     → design.md draft
           ↓
Phase 3: Moodboard Generation + Back-Round Interview → design.md final
           ↓
Phase 4: Visual Anchoring (Moodboard + Mockup + Motion frames)
           ↓
Phase 5: Asset Generation
           ↓
Phase 6: Code Implementation (+ Anti-Slop Gate crosscut)
           ↓
Phase 7: Iteration & Review
```

### Skill-to-Phase Mapping

| Phase | Skill | Purpose |
|-------|-------|---------|
| Phase 1 (front round) | `frontend-interview-dualround` | Extract product boundary + main language |
| Phase 2 | `frontend-design-research` | Six-dimension site research |
| Phase 3 (back round) | `frontend-interview-dualround` | Lock architecture + section + copy tone |
| Phase 4 | `frontend-visual-reference` | Moodboard + full mockup + motion frame sequence |
| Phase 4C–6 | `frontend-motion-prompt-writer` | Code-level motion prompt per component |
| Phase 1–7 (ongoing) | `frontend-design-writer` | Write/maintain design.md |
| Phase 6 (crosscut) | `frontend-anti-slop-gate` | Scan every code generation for 10 red lines |
| Phase 7 | `frontend-design-review` | Translate "feels wrong" into actionable changes |
| Expansion | `frontend-iteration-planner` | Route expansions without overwriting existing design |
| Multi-language | `frontend-i18n-essentials` | i18n planning and execution |
| Backend/API | `system-design` | Architecture decisions and Design Docs |

---

## 8. Frontend Design Research (Six Dimensions)

> **Skill:** `frontend-design-research` | Source: `ai-frontend-design-kit-main`

### What This Is
A mechanical framework for researching 4–5 excellent reference sites in your domain. The Six Dimensions (形/色/字/构/质/动 — Form/Color/Type/Structure/Texture/Motion) turn vague "gut feel" into quantifiable, orthogonal data.

**Use when:** Starting a new project, full site redesign, or major design iteration.

### The Six Dimensions

| Dimension | Chinese | What to Measure |
|-----------|---------|----------------|
| **Form** (形) | Xíng | Shape language, component morphology, overall visual weight |
| **Color** (色) | Sè | Palette, contrast ratios, color zones and meaning |
| **Type** (字) | Zì | Font families, sizes, weights, hierarchy system |
| **Structure** (构) | Gòu | Grid system, layout logic, information hierarchy |
| **Texture** (质) | Zhì | Material quality, surface treatment, depth and layering |
| **Motion** (动) | Dòng | Animation types, timing, trigger conditions, directionality |

### Process
```
Step 0: Classify → Display type (landing/marketing) or Tool type (dashboard/app)?
Step 1: Validate Main Language (must exist as a verb sentence, not adjective)
Step 2: Six-Dimension Analysis × 4–5 sites (ONE site at a time — context protection)
Step 3: Synthesize into design.md draft
```

**Display type:** Run all 6 dimensions, Motion is most critical.
**Tool type:** Focus on Structure + Type; Motion can be near-empty.

### DOM Quantification Approach
Measure actual DOM values, not impressions:
- Typography: computed `font-size`, `line-height`, `letter-spacing` in px
- Color: exact hex from computed styles, contrast ratios
- Spacing: `padding`, `gap`, `margin` values from DevTools
- Animation: `transition-duration`, `animation-timing-function`, `transform` values

---

## 9. Frontend Interview Dualround

> **Skill:** `frontend-interview-dualround` | Source: `ai-frontend-design-kit-main`

### What This Is
Two rounds of deep interview from a **product designer perspective** — not just frontend designer. Extracts the hidden architecture, copy tone, and interaction paths from the user's mind before any code is written.

**Key difference from frontend-design-review:** This is code-BEFORE. Review is code-AFTER.

### Front Round (Phase 1) — Build Product Boundary

Goal: Lock in the Main Language (a verb sentence describing the core visual motion/logic) and product scope.

**Five question categories:**
1. **Positioning** — Who is this for? What do they feel when they land here?
2. **User** — What's the user's state of mind when arriving? What are they looking for?
3. **Reverse** — What should this definitely NOT be? What would make you say "that's wrong"?
4. **Resources** — Do you have existing brand assets, fonts, colors?
5. **Timeline** — What's the first deliverable? What's the launch pressure?

**Rules:** 3–5 questions at a time max. Multiple-choice preferred over open-ended. Main Language must be a verb sentence: "Chaos converges to order as you scroll" ✓ / "High-end geek feel" ✗

### Back Round (Phase 3) — Lock Detail After Moodboard

Goal: Extract architecture, sections, copy tone, and interaction paths after the user has seen visual direction options.

**Four question categories:**
1. **Architecture** — How many pages? What's the navigation structure?
2. **Section** — What sections does the homepage need? What order?
3. **Copy tone** — Is the copy direct or poetic? Technical or accessible?
4. **Interaction paths** — What's the primary CTA? What happens after conversion?

---

## 10. Frontend Visual Reference (Moodboard + Mockup + Motion)

> **Skill:** `frontend-visual-reference` | Source: `ai-frontend-design-kit-main`

### What This Is
Phase 4 — lock the visual direction with three image-level anchors before writing a single line of code.

### The Three Visual Anchors

| Anchor | Form | What It Locks | Exploration |
|--------|------|--------------|-------------|
| **A. Moodboard** | Style board (color palette + material samples + symbol set + fonts + UI snippets) | Six static dimensions (Form/Color/Type/Structure/Texture) | ★ **2–3 variants** for user to choose |
| **B. Full-page Mockup** | Complete page layout from hero to footer | Real layout + information hierarchy + narrative flow | Single line: homepage → approval → subpage |
| **C. Motion Frame Sequence** | Left-to-right frame-by-frame animation preview | Motion dimension | Single line: one sequence per core animation |

**Core bet:** Image generation is cheap + visual communication is direct → front-load exploration to the image layer, execute code single-line.

**Folder structure:**
```
knowledge/design-docs/visual-anchors/
├── moodboard-prompt.md        (§12 in design.md)
├── mockup-homepage.md         (§13)
└── motion-frames/             (§14)
    ├── hero-entrance.md
    └── loading-screen.md
```

---

## 11. Frontend Design Writer (design.md)

> **Skill:** `frontend-design-writer` | Source: `ai-frontend-design-kit-main`

### What This Is
The main writer for all design documentation — compresses Phase 1–4 outputs into three Agent-executable delivery files.

### Three Delivery Files

| File | Frequency | Purpose |
|------|-----------|---------|
| `design.md` | High frequency | Main language + tokens + Agent prompt guide + motion spec + interview records |
| `DESIGN-LANGUAGE.md` | Low frequency | Core design language, stable reference |
| `MOTION-SPEC.md` | Medium frequency | Macro motion specification |

### The 15-Section design.md Structure (kun format)

| Section | Content |
|---------|---------|
| §0 | Main Language (verb sentence) |
| §1 | Goals & Non-goals |
| §2 | Target Users |
| §3 | Form tokens (shapes, borders, shadows) |
| §4 | Color tokens |
| §5 | Typography tokens |
| §6 | Structure tokens (grid, spacing) |
| §7 | Texture tokens |
| §8 | Don'ts (anti-slop baseline from the 10 red lines) |
| §9 | Agent Prompt Guide |
| §10 | MOTION-SPEC (macro animation language) |
| §11 | Interview records (dual-round outputs) |
| §12 | Moodboard Prompt reference |
| §13 | Page Mockup Prompt reference |
| §14 | Motion Frame Prompts reference |

### Three-Round Writing Sequence
Write in rounds, not §1–§14 in order:
- **Round 1:** §0 (Main Language), §1 (Goals), §2 (Users) — establish foundation
- **Round 2:** §3–§8 — Six-dimension tokens from research data
- **Round 3:** §9–§14 — Agent guides, motion spec, visual anchor references

---

## 12. Frontend Motion Prompt Writer

> **Skill:** `frontend-motion-prompt-writer` | Source: `ai-frontend-design-kit-main`

### What This Is
Translates macro motion specs (MOTION-SPEC.md) into code-level implementation prompts — one per core animation component. Agents read these prompts to write Framer Motion code.

**Trigger:** "Write the LoadingScreen motion prompt" / "Translate Hero entrance to code spec" / "Generate motion-prompts/*.md"

### Two Layers of Motion Documentation

| Layer | Who Reads It | Created By |
|-------|-------------|-----------|
| **Macro (MOTION-SPEC.md / design.md §10)** | Humans + Agents | `frontend-design-writer` §10 |
| **Micro (motion-prompts/{Component}.md)** | Agents → write code directly | `frontend-motion-prompt-writer` |

### LoadingScreen-Style Prompt Format (6 Required Elements)

```markdown
## {ComponentName} Motion Prompt

### Theme Tokens
(Color, spacing, font variables this component uses)

### Font References
(Exact font-family and weights)

### Component Signature
(TypeScript props interface)

### Per-Element Specs
(Each animated element: initial state, final state, timing, easing)

### Parent Component Behavior
(How children are orchestrated — stagger, sequence, parallel)

### Timing Table
| Element | Delay | Duration | Easing |
|---------|-------|----------|--------|
```

**Key rule:** Generate on-demand at Phase 4C and 6 — NOT all at once upfront.

---

## 13. Frontend Design Review

> **Skill:** `frontend-design-review` | Source: `ai-frontend-design-kit-main`

### What This Is
Post-code design review (Phase 7). Translates "feels wrong" into specific, actionable changes using three-stage questioning + parameter surfacing.

**Use only after code is generated.** For pre-code ambiguity, use `frontend-interview-dualround`.

### Core Division of Labor

| Role | Responsible For | NOT Responsible For |
|------|----------------|---------------------|
| **User** | Feeling judgment ("this feels off", "this is good") | Explaining why, providing parameters, writing standards |
| **AI** | Translating feeling into specific dimensions + parameters + actionable changes | Judging what looks good |

**Aesthetic judgment is implicit cognition** — users can't articulate it cold, but know it when they see it. Asking them to explain upfront is asking the impossible. The only tool is questioning.

### Three Review Modes

| Mode | Trigger | Focus |
|------|---------|-------|
| **design-review** | "Feels wrong" / "not premium enough" / "review this page" | Visual vs. DESIGN.md and reference sites |
| **design-content** | "Copy feels AI-generated" / "information hierarchy is off" | Copy, information architecture, reading rhythm |
| **design-harden** | "Harden it" / "check edge cases" / "mobile version" | Edge states, responsive, animation correctness |

### Three-Stage Questioning

**Stage 1 — Locate (Where):**
Good: "Is the whole thing wrong or just a section?" / "Where does your eye land first?" / "Rate it 1-10, what scores lowest?"
Bad: "What specifically is wrong?" (too open) / "Is it the font?" (narrows too fast)

**Stage 2 — Benchmark (Against What):**
Good: "Which part of the reference site feels off by comparison?" / "Is it more like A or B?" (give concrete examples)
Bad: "What style do you want?" (requires abstract description)

**Stage 3 — Quantify:**
Good: "Current `font-size: 48px` — does it need to go to 56px or 64px?" / "Current gap is 24px — is it too tight or too loose?"
Bad: "Make the title bigger" (no target) / "Loosen up the spacing" (no amount)

### Parameter-Surfacing Tweaks
Expose uncertain parameters as adjustable knobs:
```markdown
## Tweaks — {ComponentName}

### Typography
- title-size: [current: 48px] → [candidate: 56px / 64px] — User choice
- body-leading: [current: 1.6] → [candidate: 1.7 / 1.8]

### Spacing  
- section-gap: [current: 80px] → [candidate: 96px / 120px]

### Color
- accent-saturation: [current: 80%] → [candidate: 70% / 90%]
```

---

## 14. Frontend Iteration Planner

> **Skill:** `frontend-iteration-planner` | Source: `ai-frontend-design-kit-main`

### What This Is
The entry router for expansion/iteration on an **existing project with a finalized design.md**. Prevents the AI from "pretending it's a new project" and overwriting the established design language.

**Trigger:** "Add a new page" / "Add a section to homepage" / "Change this button color" / "design.md exists, now expand X"

**Do NOT use for:** Brand-new projects → use `frontend-interview-dualround` | Full site visual rewrite → go back to Phase 2–4 | Pure bug fixes → dev workflow.

### Three Expansion Tiers

| Tier | What It Is | Minimum Path |
|------|-----------|--------------|
| **T1 — New Page** | New route (e.g., `/blog`, `/pricing`) | Light back-round → 4B local mockup → code → review + write back to design.md |
| **T2 — New Section** | New section in existing page | Minimal back-round → optional 4B → code → review + write back |
| **T3 — Micro-change** | Single token change (color, font-size, animation param) | Direct code → review + write back relevant section |

### Step 0: Read Old Assets First (Always)
Before anything:
1. Read `knowledge/design-docs/design.md` (Main Language, Six-dimension tokens, §9 Agent Prompt Guide, §14 Motion Prompts index)
2. Scan `knowledge/design-docs/visual-anchors/` directory list
3. Scan `knowledge/design-docs/motion-prompts/` directory list

**The existing design.md is an asset, not a liability.**

---

## 15. Frontend i18n Essentials

> **Skill:** `frontend-i18n-essentials` | Source: `ai-frontend-design-kit-main`

### What This Is
A planning and execution router for internationalization (i18n) when building multi-language websites.

**Trigger:** "Build an international site" / "Add multi-language" / "Add English version" / "i18n routing" / "localization" / "translation quality"

**Do NOT use for:** Single-language products | Pure translation (no frontend involvement) | Deep RTL layout (if no Middle Eastern target market)

### The Three Orthogonal Layers

The most common i18n failure is mixing three independent problems together:

| Layer | What It Covers | Common Symptoms |
|-------|---------------|-----------------|
| **Runtime layer** | Routing, state persistence, dynamic switching | Language switch clears form data; wrong locale on page load |
| **Translation content layer** | Text quality, cultural fit, tone | Machine-translation feel; awkward phrasing for locals |
| **Visual layer** | Fonts per language, layout for text expansion | CJK fonts falling back to system; German text overflows buttons |

**Hard rule: Diagnose the layer first. Then prescribe.**

### Translation Content Pipeline

Machine translation → AI local-person review → Human fallback

```
Subagent parallel: locale × persona × domain
  e.g., zh-TW × "local Taipei tech user" × "SaaS product copy"
       de-DE  × "Hamburg professional"    × "SaaS product copy"
       ja-JP  × "Tokyo office worker"     × "SaaS product copy"
```

### Routing Decision: Subpath vs. Subdomain

| Approach | URL Pattern | SEO | Cookie Complexity |
|----------|------------|-----|------------------|
| **Subpath** (recommended) | `/en/`, `/zh/` | Easier | Low |
| **Subdomain** | `en.site.com` | Good for separate teams | High |
| **Query param** | `?lang=en` | Poor | Low |

**Next.js i18n:** Use `next-intl` (subpath) or `next-i18next`. Prefer `generateStaticParams` for SSG locales.

---

## 16. System Design Skill

> **Skill:** `system-design` | Source: `ai-frontend-design-kit-main`

### What This Is
Architecture decisions and Design Docs for multi-module projects. Handles "how to cut the system" — module boundaries, data flow, storage, API contracts, dependency topology.

**Use when:** Multi-module projects, modifying existing systems, high-risk integrations, major tech stack decisions.

**Do NOT use for:** Frontend tech stack selection (Next.js/Vite) → `frontend-design-research` | Visual/animation/component library → `frontend-design-research` | Pure UI with no backend | Small single-module projects.

### Core Methodology: Alternatives Considered (Mandatory)

**A Design Doc without an Alternatives Considered section is a sales document, not a design document.**

### Design Doc Structure

| Section | What to Write | Quality Standard |
|---------|--------------|-----------------|
| **Background** | Context, existing system state | Non-experts can understand |
| **Goals** | Measurable outcome goals | Verifiable |
| **Non-goals** | Explicitly what this doesn't solve | Prevent scope creep |
| **Design** | Core approach, key decisions | Reproducible |
| **Alternatives Considered** | 2+ real alternatives with honest trade-offs | Each alternative treated fairly |
| **Trade-offs** | What we're giving up | Honest |
| **Open Questions** | Unresolved items | Tracked |

### Structure Impact Analysis (Always First)

Before writing a Design Doc:
- Which modules does this change touch?
- Are there modules that shouldn't be touched (boundary violation)?
- What's the data flow direction? Any circular dependencies?
- What are the failure modes? If one module goes down, what's affected?
- Is there shared state requiring locking/sync?

---

## 25. Website Design Styles — Complete Reference

> **Source:** `website_designs-main` | 314 web design aesthetics, each with color palettes, typography, CSS techniques, layout principles, and a working HTML example.

### How to Use
Each aesthetic has a detailed `.md` guide with: color palette (with hex codes), typography choices, layout principles, CSS implementation techniques, and visual references.

**Reference URL pattern:** `https://chrislemke.github.io/website_designs/examples/{StyleName}.html`

---

### All 314 Design Aesthetics (Organized by Category)

#### Historical & Art Movement Aesthetics
3D Immersive · 70s Retro · 8-Bit · 90s Grunge · Art Deco · Art Nouveau · Arts and Crafts · Atomic Age · Baroque · Bauhaus · Biedermeier · Chicha · Chinoiserie · Constructivism · Czech Cubism · Cubism · Dadaism · De Stijl · Deconstructivism · Expressionism · Futurism · Goblincore · Gothic · Gustavian · Heroic Realism · Hollywood Regency · International Typographic Style · Japondi · Ligne Claire · Modernisme · Neoclassicism · New Objectivity · New Wave · Op Art · PC-98 · Plakatstil · Pointillism · Polish Poster School · Pop Art · Radical Design · Raygun Gothic · Rococo · Romanticism · Sacred Geometry · Suprematism · Surrealism · Ukiyo-e · Victorian · Wabi-Sabi

#### Dark & Gothic Aesthetics
Dark Academia · Dark Aero · Dark Botanical · Dark Editorial · Dark Fantasy · Dark Futurism · Dark Luxe · Dark Mode Neon · Dark Romance · Film Noir · Neon Gothic · Nordic Noir · Pixel Noir · Scandinavia Dark · Tech Noir · Terminal CLI Aesthetic · Weirdcore · Witchcore

#### Retro & Nostalgic Aesthetics
Analog Warmth · Cottagecore · Craftcore · Cozy Gamer · Dial-Up Delight · Dieselpunk · Early Cyber · Geocities · Gorpcore · Grandmillennial · Grungy Revival · Indie Sleaze · Italo Disco · Jiggy Era · Mallsoft · Memphis Design · Memphis Lite · Mid-Century Modern · Ostalgie · Retro Anime · Retro Computing · Retro Diner · Retro Futurism · Scrapbook · Skeuomorphism · Steampunk · Streamline Moderne · Synthwave · Vaporwave · Web 2.0 · Windows 95/98 · Y2K Futurism · Y2K Glam

#### Digital & Tech Aesthetics
AI Generative · Aurora Gradient · Blueprint Technical · Bento Grid · Chaos Design · Chromatic Blur · Chromecore · Crypto Aesthetic · Cyberminimalism · Cyberpunk · Cybersigilism · Data Viz Art · Generative Pattern · Glitch Art · Glassmorphism · Holographic UI · Isometric Design · Kinetic Typography · Laser Grid · Low Poly · Metalheart · Metaverse · Microinteraction Design · Neubrutalism · Neumorphism · Parallax Design · Post Digital · RGB Gamer · Sci-Fi Interface · Silicon Dreams · Spatial UI · Synthwave · Variable Typography

#### Nature & Organic Aesthetics
Biomorphic · Biophilic Design · Botanical Maximalism · Clovercore · Coastal Grandmother · Coastal Style · Cottagecore · Dark Botanical · Desert Modern · Earth Tones · Fairycore · Forestcore · Goblincore · Hygge · Ink Wash · Moss Punk · Nature Distilled · Organic Modern · Risograph · Rustic Modern · Scandi Boho · Solarpunk · Tropical Maximalism · Tuscan Rustic · Vintage Botanical · Wabi-Sabi · Zen Garden

#### Fashion & Culture "-core" Aesthetics
Acid Design · Afro Baroque · Afrofuturism · American Kitsch · Angelcore · Anti-Design · Avant Basic · Avantropop · Balletcore · Barbiecore · Catholic Kitsch · Celestialcore · Clean Girl · Cluttercore · Coquette · Corporate Grunge · Corporate Hippie · Corporate Memphis · Curly Girly · Cutecore · Cute-alism · DIY Punk · DORFic · Dopamine Design · Dreamcore · E-girl/E-boy · Ethnic Chic · Fairycore · FantasY2K · Festival Marketplace · Fitness Splatter · Gen Z Maximalism · Geo-Boho · Global Village Coffeehouse · Gorpcore · Grocery Girl Fall · Grunge Revival · Hand Drawn · Hands Up · Hipness Purgatory · Honeycore · Human Scribble · Indie Sleaze · Italo Disco · Kid Science · Kidcore · Kinfolk · Light Academia · Liminal Space · Live Laugh Love · Lush Velvet · Manguebeat · Maximalism · Medievalcore · Mediterranean · Mission School · Mixed Media · Mob Wife · Moody Maximalism · Nautical · Parisian Girly · Pastel Goth · Positivity Kawaii · Puppycore · Recessions Pop · Regencycore · Rocker Grrl Diva · Scandi Boho · Shabby Chic · Shoe Diva · Snug Simple · Soft Countriana · Streetwear · Superflat Pop · Teenpunk · Trinketcore · Tropideco · VSCO · Victorian · Warm Industrial · Wes Anderson · Western Frontier · Whimsigothic · Y3K Hyperfuturism

#### Minimalist & Modern Aesthetics
Bauhaus · Bento Grid · Bold Minimalism · Brutalist Web Design · Card Based Design · Clean Girl · Coastal Style · Color Block · Colorful Pop · Concrete Brutalism · Corporate Memphis · Cyberminimalism · Danish Pastel · Flat Design · Four Colors · Geometric Modernism · Glassmorphism · Grotesk Display · International Typographic Style · Japandi · Light Skeuomorphism · Liquid Fluid Design · Liquid Glass · Liquid Metal · Luxury Minimalism · Material Design · Metro Design · Minimalism · Monochrome Luxe · Monoline Illustration · Neo Deco · Neo Minimalism · Neo Pop · Neubrutalism · Neumorphism · Old Money · Quiet Luxury · Resonant Stark · Scandinavian Design · Scrollytelling · Soft Gradient · Split Screen · Techno Minimalism · Textured Minimalism · Tranquil Serenity · Typographic Brutalism · Wireframe Aesthetic

#### Maximalist & Color-Rich Aesthetics
Afro Baroque · Aurora Gradient · Balletcore · Barbiecore · Botanical Maximalism · Bright Tertiaries · Candy Pop · Celestialcore · Chaos Design · Crystal Core · Gen Z Maximalism · Gradient Mesh · Graffiti Pop · Grain and Grit · Iridescent · Maximalism · Memphis Design · Moody Maximalism · Polychrome · Pop Surrealism · Psychedelic · Radical Design · Rainbow · Risograph · Stained Glass · Sunset Gradient · Supergraphic Ultramodern · Surrealism · Vaporwave

#### Example Style Spotlight — Synthwave
**Colors:** Horizon Orange `#FF6B35` · Neon Pink `#FF2E97` · Electric Cyan `#00E5FF` · Laser Purple `#8B00FF` · Midnight Navy `#0D0221`
**Type:** Orbitron for display, monospace for body
**Key elements:** CRT scanlines, perspective grid floors, neon glow, chrome metallic text, sunset gradient

#### Example Style Spotlight — Bauhaus
**Colors:** Bauhaus Red `#E3000B` · Bauhaus Yellow `#FFD700` · Bauhaus Blue `#003DA5` · Black `#000000` · White `#FFFFFF`
**Type:** Heavy geometric sans-serif only
**Key elements:** Geometric shapes only, strict grid, flat unmodulated color, no gradients, asymmetric balance

#### The Frontend-Design SKILL.md for website_designs
Quick reference for picking design style when generating frontend:
- Identify the visual mood/culture the user wants
- Match to the closest aesthetic from the 314 styles
- Pull the corresponding `.md` guide for color palette, typography, and layout rules
- Use the working HTML example as implementation reference

---

## 26. 100 Days of Design Engineering

> **Source:** `100-Days-of-Design-Engineering-main`

### What It Is
A Next.js/React/WebGL project documenting 100 days of design engineering work — a showcase of design components, interactive elements, and WebGL experiments built as part of the "100 Days of Making" class.

### Tech Stack
- **TypeScript** (98.3%) · **CSS** (1.4%) · **JavaScript** (0.3%)
- **Next.js** · **React** · **WebGL**
- Package manager: **Bun**

### Project Architecture

```
Browser
  ↓
Root Layout (layout.tsx)
  ├── Home Page (page.tsx)
  │   └── Day entries with screenshots/previews
  └── Dynamic Day Page ([slug]/page.tsx)
      ├── Day Loading state
      ├── OpenGraph Image generation
      └── Per-day content (markdown + assets)

UI Components:
  Navbar · Footer · ThemeSwitch · ElementShowcase · FeedbackBar

Interactive Elements: /src/elements/
Content: /src/content/          (markdown per day)
Assets: /public/assets/day-N/  (screenshots, GIFs, MP4 previews)
```

### Installation
```bash
git clone https://github.com/alanvww/100-Days-of-Design-Engineering.git
bun install
bun dev
```

### What Makes It Useful
Each day's entry includes: a screenshot preview, optional GIF/MP4 video preview, interactive React/WebGL components, and markdown documentation. The project demonstrates the range of what's achievable in design engineering — from simple CSS experiments to full WebGL scenes.

---

---

## 30. Fumeng — AI Image Frontend UI (INTP Triforce)

> **Skill:** `ai-image-frontend-ui` | Source: `fumeng-main`

### What This Is
A complete system for generating frontend UI screenshots, web interfaces, mobile app screens, posters, dashboards, and design systems using **GPT Image-2** (gpt-image-2) — the current best model for UI rendering.

**North Star:** *"The bar is stunning, not functional. Every pixel is intentional, every interaction is deliberate."* — Quality target: Dribbble / Behance showcase level.

### Why GPT Image-2 for UI?
1. **Industry-leading text rendering** — characters, numbers, labels all sharp
2. **4K+ resolution** — can fit full desktop screenshots
3. **Precise geometry** — grids, icons, alignment are clean
4. **Grok-imagine-image is a disaster for UI** — distorted lines, garbled text

### The INTP Triforce (Three-Modal Closed Loop)

```
[image-2 Visual Intent]
        ↓
  Anchor visual direction with 4K mockup ($0.16–$0.40)
        ↓
[MCP True Assets]
  - mcp4_logo_search → real logos
  - mcp10_view_items → real shadcn components  
  - mcp3_query-docs → latest API docs
  - mcp0_take_screenshot → rendered result
        ↓
[LLM Code Generation]
        ↓
[chrome-devtools / playwright render]
        ↓
[Cross-modal diff → converge]
```

**vs. Single-modal (ConardLi):** LLM generates HTML → human eyeballs → done. No visual intent lock, no real assets, no render validation.

### Three Operating Modes

| Mode | When to Use | Core Action | Cost |
|------|------------|-------------|------|
| **Mode A — Explore** | User has vague idea | Generate 2–3 family candidates via image-2, user picks direction | ~$0.20 |
| **Mode B — Ship** | User has visual mockup → needs code | MCP fetches real shadcn components + logos + API docs → code → visual-to-code loop | Varies |
| **Mode C — Audit** | User has existing code/site | playwright screenshot + lighthouse audit + anti-slop diagnosis + image-2 draws corrected version | Varies |

### 6 Iron Rules (The Most Important Principles)

#### Rule 1: Drive 4 Dimensions Independently (Anthropic Official)
Never write `"make it beautiful"`. Drive each dimension separately:
```
Typography: {{specific font + character}}
Color: {{dominant color + sharp accent + background}}
Motion: {{suggest dynamic / or declare static editorial}}
Background: {{texture / gradient / geometric / atmosphere}}
```

#### Rule 2: Explicitly Challenge AI Slop Defaults
Tell the model what NOT to do:
```
AVOID: Inter, Roboto, Arial, Space Grotesk fonts.
AVOID: purple-to-pink gradients.
AVOID: 3-column symmetric feature grids.
AVOID: rounded-12px card sameness.
```

#### Rule 3: Describe UI as "an existing product", not a design exercise
- ❌ `Design a modern dashboard with sleek UI`
- ✅ `A SaaS analytics dashboard screenshot showing daily active users chart on the left...`

#### Rule 4: Exact text must use quotes or ALL CAPS
- ❌ `A pricing page with three plans`
- ✅ `Headline (EXACT TEXT): "Simple pricing for every team". Three pricing cards: STARTER $0/mo, PRO $29/mo, ENTERPRISE custom.`

#### Rule 5: Say "looks like a real product" not "like a design draft"
- ❌ `with a designer aesthetic, modern vibes, clean look`
- ✅ `Looks like a real shipped product screenshot, 8px grid, 16px body text, perfect kerning, subtle card shadows, pixel-perfect alignment`

#### Rule 6: Pick a Family First, Then Fill Details
> *"Good hi-fi designs do not start from scratch — they are rooted in existing design context."*
Starting from zero = guaranteed AI slop. Always anchor to an aesthetic family + 1–2 brand references first.

### 5-Slot Universal Prompt Template
```
Scene:     [Viewport type: desktop 1440px / mobile 390px / poster / IDE]
Subject:   [What UI component or page: dashboard / pricing / landing / app screen]
Details:   [Paste aesthetic family prompt snippet here]
Use case:  [What the product does, who uses it]
Constraints: [Exact text strings, states, anti-slop rules paste]
```

### Image Size & Cost Reference

| Size | Use For | Quality | Cost/image |
|------|---------|---------|-----------|
| `1536x1024` | Desktop Web / Dashboard | high | $0.16 |
| `2560x1440` | Desktop 2K | high | $0.22 |
| `1024x1536` | Mobile App Screen | high | $0.16 |
| `1024x1024` | Poster / Square | high | $0.16 |
| `3840x2160` | 4K screenshot (experimental) | high | $0.40 |

**Workflow:** Run `low` quality first to proof → switch to `high` for final.

### Quick Lookup by Use Case

| Task | Read First | Template |
|------|-----------|----------|
| SaaS dashboard | Family 4 Data-Dense | `templates/saas-dashboard.txt` |
| Anthropic-style landing | Family 3 Warm Editorial | `templates/landing-page.txt` |
| Dev tool site | Family 2 Terminal-Core | `templates/landing-page.txt` |
| AI product hero | Family 5 Cinematic Dark | `templates/landing-page.txt` |
| Mobile Todo app | Family 3 or 7 | `templates/mobile-app-screen.txt` |
| Editor / IDE screenshot | Family 2 Terminal-Core | `templates/ide-terminal.txt` |
| Product poster | Family 8 Neon Brutalist | `templates/marketing-poster.txt` |
| Design system showcase | Family 1 Editorial | `templates/design-system.txt` |

---

## 31. 9 Aesthetic Families for UI Generation

> **Source:** `fumeng-main` — `aesthetic-families.md`

Use the **Picker (3 Questions)** to select a family, then copy the `image-2 prompt snippet` directly into your prompt.

### Picker: Which Family?

**Q1: Product is read-heavy or scan-heavy?**
- Read-heavy (docs, blog, long content) → Family 1 or 3
- Scan-heavy (dashboard, data, monitoring) → Family 4 or 2

**Q2: Who is the user?**
- Developer → Family 2 or 4
- Designer / Creator → Family 5 or 6
- Consumer → Family 7 or 6
- Prosumer → Family 3

**Q3: Does the brand need to show courage?**
- Yes → Family 8 or 9
- No → Stay in 1–7

---

### Family 1 — Editorial Minimalism
**Brands:** Linear · Stripe · Vercel · Mintlify
**Character:** Clean neutral + single sharp accent. Serif or narrow grotesque. For reading.
**Palette:** White `#FFFFFF` / Near-black `#0F0F14` / Violet `#5E6AD2`
**Use for:** Docs sites, pricing pages, blogs, SaaS landing

**Prompt snippet:**
```
Visual style: Editorial minimalism in the spirit of Linear + Stripe.
Color: pure white #FFFFFF background, near-black #0F0F14 headlines,
       gray #687076 body, single sharp violet accent #5E6AD2 on
       interactive elements — NOT a gradient.
Typography: narrow humanist grotesque (GT Planar / Söhne feel, NOT Inter).
       Display 56–72px tight tracking. Body 16–18px line-height 1.6–1.7.
Background: solid white. ONE hairline rule 1px #E3E4E6 between sections.
```

---

### Family 2 — Terminal-Core
**Brands:** Ollama · Warp · Raycast · OpenCode
**Character:** All monospace. Near-black + phosphor green/cyan/amber. Hard edges. CLI metaphors.
**Palette:** Black `#0B0D14` / Cyan `#16D5E6` / Coral `#FF7A59`
**Use for:** Dev tools, CLI products, DevOps dashboards

**Prompt snippet:**
```
Visual style: Terminal-core in the spirit of Warp + Raycast.
Color: near-black #0B0D14, soft white #E5E7EB, one cyan accent #16D5E6,
       coral #FF7A59 for errors. NO other colors. NO gradients.
Typography: 100% monospace — JetBrains Mono / Berkeley Mono feel.
       BANNED: any variable-width font.
Background: flat near-black, optional CRT scanline at 2% opacity.
Layout: hard 90° corners. Box-drawing chars for borders. $ prompt markers.
```

---

### Family 3 — Warm Editorial ⭐ (Anthropic's Style)
**Brands:** Anthropic · Notion · Resend · Substack
**Character:** Terracotta / cream / earth tones. Serif body or warm humanist. Human, refined.
**Palette:** Cream `#F4F3EE` / Terracotta `#C96442` / Ink `#191817`
**Use for:** Writing tools, editors, media sites, Anthropic-style products

**Prompt snippet:**
```
Visual style: Warm editorial in the spirit of Anthropic + Notion.
Color: cream #F4F3EE background (warmer than white, paper-like),
       deep ink #191817 primary text, warm gray #716B66 secondary,
       terracotta accent #C96442 on links and CTAs.
Typography: characterful serif body (Tiempos Text / PP Editorial New feel).
       Softened geometric sans display (Söhne Breit feel). Line-height 1.55–1.7.
```

---

### Family 4 — Data-Dense Pro
**Brands:** Grafana · DataDog · PlanetScale · Turso
**Character:** Information at maximum density. Mono for numbers. Semantic colors for status. Zero waste.
**Palette:** Dark `#0D1117` / Cyan `#00D4FF` / Green `#00E676` / Amber `#FFB800`
**Use for:** Admin dashboards, monitoring, analytics, reporting

**Prompt snippet:**
```
Visual style: Data-dense pro in the spirit of Grafana + DataDog.
Color: very dark background #0D1117, surface #161B22, borders #30363D,
       primary text #C9D1D9, one primary data accent (cyan #00D4FF or
       green #00E676 — pick one). Semantic: green success, amber warning,
       red error.
Typography: tabular numbers monospace for all metrics and values.
       Small but legible: 11–13px for dense rows, 14–16px for labels.
Layout: extreme density. Maximum info per viewport. No hero space.
```

---

### Family 5 — Cinematic Dark
**Brands:** Runway ML · ElevenLabs · Suno · Pika
**Character:** Film-grade darkness. Blurred bokeh bg. Neon accent. Cinematic hero.
**Palette:** `#05070F` bg / `#6366F1` indigo / `#A78BFA` violet / `#F0ABFC` pink
**Use for:** AI creative tools, media generation, entertainment tech

**Prompt snippet:**
```
Visual style: Cinematic dark in the spirit of Runway ML + ElevenLabs.
Color: near-black #05070F background, one primary gradient accent
       (indigo #6366F1 to violet #A78BFA — used ONLY on the hero element,
       not as background). Cards: semi-transparent dark with blur.
Typography: refined geometric sans, large generous display (80–100px hero).
Background: dark with subtle noise texture at 3% opacity, optional bokeh
       glow orb behind hero content.
```

---

### Family 6 — Playful Color
**Brands:** Linear (old) · Framer · Loom · Pitch
**Character:** Controlled maximalism. One bold hue dominates. Geometric shapes. Joyful, confident.
**Palette:** Coral `#FF6B6B` or Electric Blue `#4ECDC4` dominant + deep neutrals
**Use for:** Product-led growth tools, collaboration apps, early-stage startups

**Prompt snippet:**
```
Visual style: Playful color in the spirit of Framer + Loom.
Color: ONE bold dominant hue (coral #FF6B6B or electric #4ECDC4), deep
       neutral base #1A1A2E or #0F0F0F, white text on dark.
       Geometric accent shapes in the bold color. NOT a rainbow palette.
Typography: confident geometric sans, heavy weight headlines (700–900),
       friendly rounded feel.
Layout: asymmetric. Large color blocks. Bold overlapping elements.
```

---

### Family 7 — Glass / Soft-Futurism
**Brands:** Apple (Vision Pro era) · Raycast (light mode) · Codeium
**Character:** Frosted glass cards. Subtle gradients. Premium clean. iOS-like refinement.
**Palette:** White `#FAFAFA` / `rgba(255,255,255,0.7)` glass / Soft purple `#C084FC`
**Use for:** Consumer apps, Apple-ecosystem products, premium B2C

**Prompt snippet:**
```
Visual style: Glass / soft-futurism in the spirit of Apple Vision Pro UI.
Color: light background #FAFAFA or #F0F0F5, glass cards rgba(255,255,255,0.7)
       with backdrop-filter blur 20px, ONE soft accent (#C084FC or #60A5FA).
       NO harsh blacks.
Typography: system-grade humanist sans (SF Pro / Plus Jakarta Sans feel).
       Light weight for body, medium for UI labels.
Background: subtle gradient mesh — two soft hues bleeding into each other.
```

---

### Family 8 — Neon Brutalist
**Brands:** CSS Tricks (old) · Poolsuite FM · some crypto projects
**Character:** Raw structure + electric neon. System fonts for body. Hard grid. Intentional ugliness as aesthetic.
**Palette:** Black `#000000` / White `#FFFFFF` + ONE neon (Electric Lime `#CCFF00` or Hot Pink `#FF00FF`)
**Use for:** Counter-culture brands, edgy tech products, NFT/crypto, underground tools

**Prompt snippet:**
```
Visual style: Neon brutalist — raw grid structure, NO decorative shadows,
       one electric accent (#CCFF00 lime or #FF00FF hot pink).
Color: pure black #000000 background, white #FFFFFF text,
       ONE neon accent. THREE colors total. Zero gradients.
Typography: system fonts for body (Helvetica / Arial / Times intentional).
       Display: condensed heavy grotesque (Impact / Bebas feel).
Layout: exposed grid lines (1px white borders). Hard rectangles. Overlapping.
```

---

### Family 9 — Cult / Indie Picks
**Brands:** Are.na · Merveilles · Monodraw · Buttondown
**Character:** Personality-first. Often warm sepia/amber, hand-crafted feel, distinctive typography. Small-studio energy.
**Palette:** Sepia `#F5EDD6` / Dark Brown `#2D1810` / Amber `#D4872C`
**Use for:** Indie makers, niche tools, personal projects, design studios

**Prompt snippet:**
```
Visual style: Cult indie picks — warm sepia + amber, hand-crafted feel,
       small-studio energy.
Color: sepia background #F5EDD6, dark brown text #2D1810,
       amber accent #D4872C on links/CTAs.
Typography: distinctive serif (Freight Display / editorial character),
       paired with narrow grotesque (like Aktiv Grotesk Condensed).
Background: slight paper texture at 5% opacity. One thin decorative rule.
Layout: centered single column for editorial; dense for tools.
```

---

## 32. Frontend Design v2 — Aesthetic Directions & References

> **Skill:** `frontend-design` v2 | Source: `frontend-design-main_2`

### Extended Aesthetic Direction Menu

This is an expanded set of directions beyond the 8-anchor system — use for broader inspiration when choosing a design direction.

#### Minimalist Directions
| Direction | Character |
|-----------|-----------|
| **Brutally Minimal** | Stark contrast, system fonts, zero decoration, maximum whitespace |
| **Swiss Modernism** | Grid-based, geometric, structured, limited color |
| **Japanese Zen** | Natural materials, subtle shadows, breathing room, muted tones |
| **Scandinavian** | Clean lines, natural light, soft colors, functional beauty |

#### Maximalist Directions
| Direction | Character |
|-----------|-----------|
| **Maximalist Chaos** | Layered elements, bold typography, explosive color, controlled chaos |
| **Neo-Brutalism** | Bold shapes, thick borders, shadow extrusion, high contrast |
| **Y2K/Cyber** | Metallic gradients, chrome effects, futuristic UI, neon accents |
| **Retro-Futuristic** | 70s/80s sci-fi, analog/digital fusion, warm gradients |

#### Distinctive Styles
| Direction | Character |
|-----------|-----------|
| **Editorial/Magazine** | Bold typography hierarchy, generous images, asymmetric grids |
| **Art Deco/Geometric** | Symmetry, gold accents, geometric patterns, luxury feel |
| **Organic/Natural** | Curves, earth tones, textures, hand-drawn elements |
| **Soft/Pastel** | Gentle gradients, rounded corners, light colors, dreamy atmosphere |
| **Industrial/Utilitarian** | Raw materials, monospace fonts, technical aesthetic |
| **Glassmorphism** | Frosted glass effects, transparency, layered depth |
| **Neumorphism** | Soft shadows, subtle extrusion, tactile interfaces |
| **Claymorphism** | 3D clay-like textures, soft shadows, playful depth |

### Font Selection Guide

#### Display / Heading Fonts (Bold Personality)
| Category | Fonts |
|----------|-------|
| Serif | Playfair Display, Crimson Pro, Spectral, Lora, Fraunces |
| Sans-serif | DM Sans, Manrope, Outfit, Sora, Cabinet Grotesk, Archivo |
| Geometric | Montserrat, Raleway, Poppins (use sparingly) |
| Condensed | Anton, Bebas Neue, Oswald, Barlow Condensed |
| Editorial | Bodoni Moda, Libre Baskerville, Cormorant |
| Experimental | Righteous, Unbounded, Rubik, Recursive |

#### Body / Text Fonts (Readable Comfort)
| Category | Fonts |
|----------|-------|
| Classic | Source Sans Pro, Public Sans, IBM Plex Sans, Work Sans |
| Modern | Instrument Sans, Geist, Satoshi, Plus Jakarta Sans |
| Editorial | Lora, Merriweather, Source Serif Pro, Bitter |
| Technical | JetBrains Mono, Fira Code, IBM Plex Mono |

### Typography Scale (Dramatic Contrast)

```css
/* GOOD - Dramatic contrast */
.hero-title   { font-size: clamp(48px, 8vw, 120px); }
.section-title { font-size: clamp(32px, 4vw, 64px); }
.body-text    { font-size: 18px; }
.caption      { font-size: 14px; }

/* BAD - Timid scaling */
.hero-title   { font-size: 36px; }  /* Too small for impact */
```

### Font Pairings

**Pattern 1 — Contrast (Serif + Sans):**
```css
:root {
  --font-display: 'Playfair Display', serif;
  --font-body: 'DM Sans', sans-serif;
}
```

**Pattern 2 — Harmony (Same family, different weights):**
```css
:root {
  --font-display: 'Outfit', sans-serif;
  --font-body: 'Outfit', sans-serif;
  --weight-display: 700;
  --weight-body: 400;
}
```

### Color Strategy

**Dominant + Accent Pattern:**
```css
:root {
  --primary: #1a1a1a;      /* 60% — one dominant */
  --accent: #ff6b35;       /* 30% — one accent */
  --highlight: #f7f052;    /* 10% — one highlight */
  --background: #fafafa;
  --text: #2d2d2d;
}
```

**Monochromatic with Punch:**
```css
:root {
  --color-900: #0a2540;
  --color-700: #1a4d7a;
  --color-500: #2a7ab0;
  --color-300: #5fa8d3;
  --color-100: #b8dced;
  /* One contrasting accent only */
  --accent: #ff6b35;
}
```

**NEVER:**
- ❌ Purple gradients on white background
- ❌ Blue (#0070f3) + White (Vercel clone feel)
- ❌ Generic rainbow gradients
- ❌ Equal distribution of colors (timid palette)

### The "One Memorable Thing" Rule
Every design needs ONE standout feature people will remember:
- *"The hero section uses diagonal type layout with aggressive cropping"*
- *"Navigation dissolves into view with particle effects"*
- *"Cards cast dramatic shadows that respond to cursor position"*
- *"Typography scales from 12px to 120px in one scroll"*
- *"Background has animated gradient mesh that shifts with scroll"*

---

## 33. Animation Patterns Library

> **Source:** `frontend-design-main_2` — `references/animation-patterns.md`

### Animation Philosophy
- **Quality over quantity** — One well-orchestrated moment beats scattered micro-interactions
- **Performance first** — Animate `transform` and `opacity` ONLY. Never animate `width`, `height`, `top`, `left`
- **Respect preferences** — Always include `prefers-reduced-motion` fallbacks

### Page Load Animations

**Staggered Fade-In (Classic):**
```css
.fade-in-stagger > * {
  animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}
.fade-in-stagger > *:nth-child(1) { animation-delay: 0.1s; }
.fade-in-stagger > *:nth-child(2) { animation-delay: 0.2s; }
.fade-in-stagger > *:nth-child(3) { animation-delay: 0.3s; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Scale-In Reveal (Bouncy):**
```css
.scale-in {
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
}
```

**Slide-In from Side:**
```css
.slide-in-left {
  animation: slideInLeft 0.7s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-100px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

### Scroll-Triggered Animations (Intersection Observer)

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      observer.unobserve(entry.target); // Animate once
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
```

```css
[data-animate] {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
[data-animate].animate-in {
  opacity: 1;
  transform: translateY(0);
}
```

### Hover Micro-Interactions

**Card Lift:**
```css
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}
```

**Button Press (Tactile):**
```css
.button {
  transition: transform 0.1s ease;
}
.button:active {
  transform: scale(0.97);
}
```

**Magnetic Hover (JS):**
```javascript
document.querySelectorAll('.magnetic').forEach(element => {
  element.addEventListener('mousemove', (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    element.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  });
  element.addEventListener('mouseleave', () => {
    element.style.transform = 'translate(0, 0)';
    element.style.transition = 'transform 0.3s ease';
  });
});
```

### Loading & Skeleton States

**Skeleton Screen (preferred over spinner):**
```css
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Gradient Animations

**Animated Gradient Background:**
```css
.gradient-bg {
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}
@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### Reduced Motion Fallback (Always Include)

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 34. Typography Mastery

> **Source:** `frontend-design-main_2` — `references/typography-mastery.md`

### Font Psychology Reference

| Font | Use For | Emotional Tone |
|------|---------|---------------|
| **Playfair Display** | Luxury brands, editorial, high-end products | Sophisticated, refined |
| **Crimson Pro** | Publishing, reading-heavy, academic | Intellectual, trustworthy |
| **Fraunces** | Creative agencies, art platforms, unique brands | Quirky, distinctive |
| **DM Sans** | SaaS products, modern brands, tech companies | Professional, clean |
| **Manrope** | Startups, apps, digital products | Friendly, open, modern |
| **Outfit** | Fashion, lifestyle, creative projects | Contemporary, stylish |
| **Sora** | Tech products, AI/ML companies | Technical, forward-thinking |
| **Cabinet Grotesk** | Design studios, portfolios, agencies | Refined, sophisticated |
| **Anton** | Headlines, sports brands, impact | Bold, powerful, condensed |
| **Bebas Neue** | Posters, banners, attention-grabbing | Strong, condensed, impactful |
| **Righteous** | Fun brands, gaming, youth | Playful, rounded, energetic |
| **Unbounded** | Tech brands, futuristic, innovation | Modern, geometric, tech-forward |

### Modular Type Scale System

```css
/* Perfect Fourth Scale (ratio: 1.333) */
--text-xs:   0.563rem;   /* 9px  */
--text-sm:   0.75rem;    /* 12px */
--text-base: 1rem;       /* 16px */
--text-lg:   1.333rem;   /* 21px */
--text-xl:   1.777rem;   /* 28px */
--text-2xl:  2.369rem;   /* 38px */
--text-3xl:  3.157rem;   /* 51px */
--text-4xl:  4.209rem;   /* 67px */

/* Major Third Scale (ratio: 1.25) — tighter, for UI */
--text-xs:   0.64rem;
--text-sm:   0.8rem;
--text-base: 1rem;
--text-lg:   1.25rem;
--text-xl:   1.563rem;
--text-2xl:  1.953rem;
--text-3xl:  2.441rem;
--text-4xl:  3.052rem;
```

### Letter Spacing by Use Case

```css
.heading-tight     { letter-spacing: -0.04em; }  /* Large display headers */
.heading-normal    { letter-spacing: -0.02em; }  /* Section headers */
.body              { letter-spacing: 0; }         /* Body copy */
.caption           { letter-spacing: 0.02em; }   /* Small text */
.overline-caps     { letter-spacing: 0.1em; }    /* ALL CAPS labels */
.tracking-widest   { letter-spacing: 0.2em; }    /* Decorative spacing */
```

### Typographic Contrast Patterns

**Large-to-Small Contrast:**
```css
.hero-number {
  font-size: clamp(80px, 15vw, 200px);
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: -0.05em;
}
.hero-descriptor {
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
```

**Weight Contrast (Same Size):**
```css
.stat-value { font-weight: 900; }
.stat-label { font-weight: 300; font-size: 0.8em; }
```

### Variable Font Usage

```css
/* Animate font weight on hover */
@supports (font-variation-settings: normal) {
  .variable-text {
    font-family: 'Recursive', sans-serif;
    font-variation-settings: 'wght' 400;
    transition: font-variation-settings 0.3s ease;
  }
  .variable-text:hover {
    font-variation-settings: 'wght' 800;
  }
}
```

### Vertical Rhythm System

```css
:root {
  --base-size: 1rem;       /* 16px */
  --line-height: 1.5;      /* 24px baseline */
  --space-unit: 1.5rem;    /* = 1 baseline unit */
}

/* All spacing in multiples of baseline */
.spacing-1 { margin-bottom: calc(var(--space-unit) * 1);  }  /* 24px */
.spacing-2 { margin-bottom: calc(var(--space-unit) * 2);  }  /* 48px */
.spacing-3 { margin-bottom: calc(var(--space-unit) * 3);  }  /* 72px */
.spacing-4 { margin-bottom: calc(var(--space-unit) * 4);  }  /* 96px */
```

---

## 35. SaaS Product UI System

> **Skill:** `saas-product-ui-system` | Source: `ai-ui-design-skills-main`

### What This Is
The canonical skill for designing, reviewing, or implementing **calm, premium, production-ready SaaS interfaces**. Covers dashboards, settings, admin, editors, tables, forms, drawers, sidebars, and public surfaces.

**Use for:** Serious SaaS product work. **Not for:** Decorative concept art, poster design, native mobile UI.

### Core Design Philosophy

**1. Neutral-First Surfaces**
- 80–90% of the interface is neutral
- One primary accent for actions and focus
- Reserve semantic colors for status only (green/amber/red)

**2. Depth Over Decoration**
- Subtle surface gradients (not loud ones)
- Faint top highlight on elevated surfaces
- Soft multi-layer shadows
- Border contrast between parent and child surfaces
- Avoid: strong glassmorphism, aggressive blur, loud gradients on every component

**3. Structure Before Style**
1. Define the user goal, current state, and primary action
2. Choose structure: intro → summary → main area → panels → details
3. Pick layout: **flex** for toolbars/rows/aligned controls | **grid** for cards/summaries/split lanes
4. Apply tokens, typography, components
5. Final check: hierarchy obvious, accents restrained, states exist

### Surface Classification

| Surface Type | Density | Character |
|-------------|---------|-----------|
| Public marketing / trust pages | Comfortable | Spacious, persuasive |
| Authenticated product workspace | Balanced | Efficient, clear |
| Admin / operations | Compact | Dense, information-first |
| Settings / runtime configuration | Balanced | Calm, instructional |
| Editor / builder / writing | Comfortable | Focused, distraction-free |

### Layout Primitives

**Use flex for:** aligned actions, rows, toolbars, filters, control groups
**Use grid for:** summaries, card collections, split lanes, multi-column forms

### Token Defaults

```css
/* Surface */
--surface-base: oklch(98% 0 0);          /* Light page background */
--surface-raised: oklch(100% 0 0);       /* Cards, panels */
--surface-overlay: oklch(100% 0 0);      /* Modals, drawers */

/* Text */
--text-primary: oklch(15% 0 0);
--text-secondary: oklch(40% 0 0);
--text-disabled: oklch(65% 0 0);

/* Accent (one only) */
--accent: oklch(55% 0.18 250);           /* Blue-ish */
--accent-hover: oklch(48% 0.18 250);

/* Semantic */
--success: oklch(55% 0.18 145);          /* Green */
--warning: oklch(70% 0.18 70);           /* Amber */
--danger: oklch(55% 0.22 25);            /* Red */
```

### SaaS Anti-Patterns

| Anti-Pattern | Why It's Wrong |
|-------------|----------------|
| Colorful / noisy dashboards | Distracts from data — calm and neutral-first always |
| Decorative styles that break the system | Each "special" page undermines the system |
| Gradient buttons everywhere | Visual noise; reserve for primary CTAs only |
| Missing empty/loading/error states | Real products need all states |
| Giant walls of checkmarks in pricing | Group by theme, provide hierarchy |
| Copy on settings pages | UI should explain itself structurally |

### Output Contract (Default)

Unless asked for something narrower, produce:
1. Product and user assumptions
2. Surface type and density mode
3. Visual direction
4. Layout structure
5. Typography and token decisions
6. Component and state decisions
7. Responsive and accessibility notes
8. Implementation notes or critique

---

## 36. SaaS Page Blueprints

> **Source:** `ai-ui-design-skills-main` — `references/page-blueprints.md`

### Shared Rules (Apply Everywhere)
- Define the dominant action/takeaway first
- Define heading + support copy hierarchy second
- Bound long copy with readable max-widths (~65ch)
- Keep public pages more spacious than internal pages

### Landing Page Blueprint

**Recommended Section Order:**
1. Announcement bar (optional)
2. Site header
3. Hero
4. Social proof row
5. Primary feature section
6. Product tour section
7. Integrations / ecosystem
8. Use cases by role or team
9. Testimonials / customer proof
10. Pricing preview / plan teaser
11. FAQ
12. Final CTA
13. Footer

**Hero Blueprint:**
- Eyebrow (small, category or proof)
- Headline (one clear outcome)
- Supporting paragraph (2–3 sentences max)
- Primary CTA
- Optional secondary CTA
- Product screenshot or montage
- Optional trust note below CTA

### Pricing Page Blueprint

**Required Blocks:**
- Headline + short pricing philosophy line
- Billing toggle (if annual/monthly)
- 3–4 plan cards max
- Detailed feature comparison table
- FAQ (billing, users, support, compliance, cancellation)
- Enterprise / sales CTA

**Rules:**
- Recommended plan gets strongest visual emphasis
- Keep comparison rows grouped by theme
- Avoid giant walls of tiny checkmarks with no grouping
- Pricing number is the primary focal point inside each card

### Dashboard Blueprint

**Page Structure:**
- Top navigation / app shell
- Context row (page title, breadcrumb, primary action)
- Summary strip or KPI tiles
- Main content area (chart, table, or working area)
- Supporting sidebar or side panel (optional)

**Density Rules:**
- Show more with less space — aim for compact
- Tabular data prefers `14px` or smaller
- Group related metrics visually
- Use semantic color only for status (green/amber/red)

### Settings Page Blueprint

**Structure:**
- Section heading (what this section controls)
- Current state display (what is set now)
- Control (the thing to change)
- Save/confirm action (explicit or auto-save with indicator)

**Rules:**
- Short copy only — UI should explain itself structurally
- Group related settings; don't scatter them
- Destructive actions need confirmation modals
- Show all states: current, editing, saving, saved, error

---

## 37. SaaS Typography System

> **Source:** `ai-ui-design-skills-main` — `references/typography-system.md`

### Why Typography Is Critical in SaaS
Most product screens are made mostly of text, controls, and numbers. Typography handles:
- Hierarchy — what's important
- Scanning speed — how fast users find things
- Trust — professional polish
- Density management — fitting content without feeling cramped
- Accessibility — legibility for all users

### The Four Levers (Use in This Order)
1. **Size** — primary signal of importance
2. **Weight** — reinforces hierarchy within a size
3. **Color** — de-emphasis as a tool (quiet secondary text)
4. **Spacing** — breathing room creates focus

**Core principle:** Don't only ask "how do I make this headline louder?" Also ask: "How do I make surrounding text quieter?" — Reduce weight of body copy instead of making everything bold.

### Product UI Type Scale

For SaaS product screens (not marketing), use a restrained scale:

| Step | px | Use |
|------|-----|-----|
| `text-xs` | 12 | Badges, timestamps, fine print |
| `text-sm` | 14 | Table rows, form labels, secondary text |
| `text-base` | 16 | Body, form inputs, main content |
| `text-lg` | 18 | Subheadings, card titles |
| `text-xl` | 20 | Section headings (product) |
| `text-2xl` | 24 | Page titles (product) |
| `text-3xl` | 30 | Marketing section headings |
| `text-4xl`+ | 36–60 | Hero headlines, marketing only |

**Internal apps often succeed with just:** 12 / 14 / 16 / 18 / 24

### Role Mapping

| Role | Size | Weight | Color |
|------|------|--------|-------|
| Page title | 24–30px | 600–700 | Primary text |
| Section heading | 18–20px | 600 | Primary text |
| Card title | 14–16px | 500–600 | Primary text |
| Body / paragraph | 14–16px | 400 | Primary text |
| Label / form label | 12–14px | 500 | Secondary text |
| Caption / help text | 12px | 400 | Muted text |
| Badge / status | 11–12px | 500 | Semantic color |
| Table header | 12px | 600 | Muted text, ALL CAPS optional |
| Metric / KPI | 24–48px | 700–900 | Primary or accent |

### Line Height Rules

| Context | Line Height |
|---------|-------------|
| Display / headline | 1.1–1.2 |
| Section headings | 1.2–1.3 |
| Body text | 1.5–1.6 |
| Dense table rows | 1.25–1.35 |
| Form labels | 1.2–1.4 |

### Font Choice for SaaS

**Preferred neutral system fonts:**
- `Inter` → Fine for utility UI (note: overused for premium/branded work)
- `DM Sans` → Slightly warmer, good for product UI
- `Geist` → Vercel's, clean and modern
- `IBM Plex Sans` → Professional, structured

**For premium/branded SaaS:**
- Body: `Plus Jakarta Sans`, `Instrument Sans`, `Satoshi`
- Display: `Sora`, `Manrope`, `Cabinet Grotesk`

---

## 38. Image, Logo & Icon Generation

> **Skill:** `image-logo-icons` | Source: `ai-ui-design-skills-main`

### What This Is
A structured prompt system for generating brand and marketing image assets: logos, UI icons, favicons/PWA icons, blog featured images, and Open Graph social cards.

### Asset Types & Required Fields

| Type | Required Inputs | Optional |
|------|----------------|----------|
| `site_logo` | brand_name, niche, style, primary_color, mood | icon_concept, neutral_color, font_tone |
| `ui_icon` | icon_name, icon_purpose, icon_style, primary_color, size_context | stroke_weight, corner_style |
| `featured_blog_image` | article_title, keywords, primary_color, image_style, tone | visual_metaphor, focal_subject |
| `social_og_image` | brand_name, page_title, tagline, primary_color, bg_style | domain_text, logo_position |
| `favicon_app_icon` | brand_symbol, shape, primary_color, secondary_color | border_style, padding_ratio |

### Smart Defaults

| Field | Default Value |
|-------|--------------|
| `neutral_color` | slate gray |
| `font_tone` | clean modern sans-serif |
| `stroke_weight` | 1.5px |
| `corner_style` | slightly rounded |
| `logo_position` | bottom-left |
| `padding_ratio` | 12% |

### Output Format (Always in This Order)
1. `Final prompt:` — the complete image generation prompt
2. `Render settings:` — size, format, quality
3. `Variation ideas:` — 2–3 alternative directions

### Global Quality Rules
- One coherent visual language per asset
- Clean and uncluttered — avoid busy compositions
- Never imitate or directly copy trademarked logos
- Optimize legibility at small sizes for logos and icons
- Keep shared brand fields consistent across multi-asset requests (brand_name, palette, mood)

---

## 39. Artifacts Builder (React + shadcn/ui)

> **Skill:** `artifacts-builder` | Source: `awesome-claude-skills-master`

### What This Is
A toolkit for building elaborate, multi-component Claude.ai HTML artifacts using modern frontend technologies. Use for complex artifacts requiring state management, routing, or shadcn/ui components — **not** for simple single-file HTML/JSX artifacts.

**Stack:** React 18 + TypeScript + Vite + Parcel (bundling) + Tailwind CSS + shadcn/ui

### 5-Step Process

```
1. Initialize  → bash scripts/init-artifact.sh <project-name>
2. Develop     → Edit generated files
3. Bundle      → bash scripts/bundle-artifact.sh → creates bundle.html
4. Display     → Share bundle.html as artifact
5. Test        → Optional: use Playwright if issues arise
```

### What `init-artifact.sh` Sets Up
- React + TypeScript via Vite
- Tailwind CSS 3.4.1 with shadcn/ui theming
- Path aliases (`@/`) configured
- 40+ shadcn/ui components pre-installed
- All Radix UI dependencies included
- Parcel configured for bundling

### Design Anti-Pattern Warning
> "To avoid AI slop: avoid excessive centered layouts, purple gradients, uniform rounded corners, and Inter font."

---

## 40. Theme Factory — 10 Pre-Set Themes

> **Skill:** `theme-factory` | Source: `awesome-claude-skills-master`

### What This Is
A curated collection of 10 professional themes — each with a complete color palette and font pairing — that can be applied to any artifact: slides, docs, reports, HTML landing pages, etc.

### The 10 Themes

| # | Theme Name | Character |
|---|-----------|-----------|
| 1 | **Ocean Depths** | Professional, calming, maritime |
| 2 | **Sunset Boulevard** | Warm, vibrant, sunset colors |
| 3 | **Forest Canopy** | Natural, grounded, earth tones |
| 4 | **Modern Minimalist** | Clean, contemporary grayscale |
| 5 | **Golden Hour** | Rich, warm, autumnal palette |
| 6 | **Arctic Frost** | Cool, crisp, winter-inspired |
| 7 | **Desert Rose** | Soft, sophisticated, dusty tones |
| 8 | **Tech Innovation** | Bold, modern tech aesthetic |
| 9 | **Botanical Garden** | Fresh, organic, garden colors |
| 10 | **Midnight Galaxy** | Dramatic, cosmic, deep tones |

### How to Apply
1. Display the `theme-showcase.pdf` for visual selection
2. Ask user to choose a theme
3. Wait for selection
4. Apply theme colors and fonts consistently throughout the artifact

### Custom Theme Generation
If no pre-set theme fits: generate a custom theme based on user description, name it descriptively, present for review, then apply.

---

## 41. Brand Guidelines (Anthropic)

> **Skill:** `brand-guidelines` | Source: `awesome-claude-skills-master`

### Anthropic Official Brand Colors

**Main Colors:**
| Name | Hex | Use |
|------|-----|-----|
| Dark | `#141413` | Primary text, dark backgrounds |
| Light | `#faf9f5` | Light backgrounds, text on dark |
| Mid Gray | `#b0aea5` | Secondary elements |
| Light Gray | `#e8e6dc` | Subtle backgrounds |

**Accent Colors:**
| Name | Hex | Use |
|------|-----|-----|
| Orange | `#d97757` | Primary accent |
| Blue | `#6a9bcc` | Secondary accent |
| Green | `#788c5d` | Tertiary accent |

### Anthropic Typography
- **Headings:** Poppins (Arial fallback)
- **Body Text:** Lora (Georgia fallback)
- **Rule:** Headings 24pt+ use Poppins; body text uses Lora

---

## 42. Image Enhancer

> **Skill:** `image-enhancer` | Source: `awesome-claude-skills-master`

### What This Is
Improves image quality — especially screenshots — by enhancing resolution, sharpness, and clarity. Inspired by Lenny Rachitsky's workflow for preparing newsletter screenshots.

### Capabilities
- Analyze: resolution, sharpness, compression artifacts
- Enhance resolution / upscale intelligently
- Improve sharpness (edge enhancement)
- Reduce artifacts and noise
- Optimize for intended use case

### Common Commands
```
Improve the image quality of screenshot.png
Upscale this image to 4K resolution
Sharpen this blurry screenshot
Reduce compression artifacts in this image
Improve all PNG files in this directory
```

### Platform Optimization Targets
| Platform | Optimal Output |
|----------|---------------|
| Blog/docs | High resolution PNG, crystal clear text |
| Social media | Platform-specific sizing, good compression |
| Presentations | Upscaled for large screen display |
| Print | High DPI, near-lossless |

**Always:** Keeps original as backup (`*-original.png`). Saves enhanced as (`*-enhanced.png`).

---

## 43. Web App Testing (Playwright)

> **Skill:** `webapp-testing` | Source: `awesome-claude-skills-master`

### What This Is
A toolkit for interacting with and testing local web applications using Python Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing screenshots, and viewing browser logs.

### Decision Tree

```
Is it static HTML?
  YES → Read HTML file directly → identify selectors → write Playwright script
  NO  → Is server running?
           NO  → python scripts/with_server.py --help → use helper
           YES → Reconnaissance first:
                   1. Navigate + wait for networkidle
                   2. Screenshot or inspect DOM
                   3. Identify selectors from rendered state
                   4. Execute actions with discovered selectors
```

### Starting a Server

```bash
# Single server
python scripts/with_server.py --server "npm run dev" --port 5173 -- python your_automation.py

# Multiple servers (backend + frontend)
python scripts/with_server.py \
  --server "cd backend && python server.py" --port 3000 \
  --server "cd frontend && npm run dev" --port 5173 \
  -- python your_automation.py
```

### Playwright Script Template

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)  # Always headless
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')  # CRITICAL: wait for JS
    
    # Reconnaissance
    page.screenshot(path='/tmp/inspect.png', full_page=True)
    
    # Actions
    page.click('button[data-testid="submit"]')
    page.fill('input[name="email"]', 'test@example.com')
    
    browser.close()
```

### Critical Rule
> ❌ Don't inspect the DOM before waiting for `networkidle` on dynamic apps.
> ✅ Always `page.wait_for_load_state('networkidle')` before any inspection or interaction.

---
