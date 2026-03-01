import { Blog } from "@/types/blog"

export const DEVELOPER_BLOGS: Blog[] = [
  {
    id: "dev-001",
    title: "Building a Modern Portfolio with Next.js 15 & GSAP",
    excerpt:
      "A deep dive into how I built this portfolio — from architecture decisions to smooth animations with GSAP and a clean dark/light theme system.",
    content: `
      <h2>Why Next.js 15?</h2>
      <p>When I started building my portfolio, I wanted something that felt <strong>fast</strong>, looked great, and showcased my skills as a full-stack developer. Next.js 15 was the obvious choice — with the App Router, Server Components, and built-in image optimization.</p>
      <h2>The Animation Stack</h2>
      <p>I went with <strong>GSAP</strong> for animations because it gives fine-grained control. The hero section uses a staggered reveal timeline, and section transitions use ScrollTrigger to tie animation progress directly to scroll position.</p>
      <blockquote><p>"Good animation is invisible — it guides the eye without demanding attention."</p></blockquote>
      <h2>Dark / Light Theme</h2>
      <p>The theme system is powered by <code>next-themes</code>, with CSS custom properties for every color token. Switching themes feels instant because there's no JavaScript color recalculation — just a class swap on <code>&lt;html&gt;</code>.</p>
      <h2>Tech Stack Summary</h2>
      <ul>
        <li>Next.js 15 (App Router)</li>
        <li>TypeScript</li>
        <li>Tailwind CSS + ShadcnUI</li>
        <li>GSAP + ScrollTrigger</li>
        <li>Zustand for state</li>
      </ul>
      <p>Building this portfolio was an exercise in restraint — keeping it minimal while making every interaction feel intentional.</p>
    `,
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14431b9?w=800&q=80",
    category: "Tutorial",
    author: {
      name: "Agung Kurniawan",
      email: "agung@dev.com",
      type: "developer",
    },
    publishedAt: "2025-12-01T08:00:00.000Z",
    readingTime: 7,
    tags: ["Next.js", "GSAP", "TypeScript"],
  },
  {
    id: "dev-002",
    title: "Zustand vs Redux: Choosing the Right State Manager in 2025",
    excerpt:
      "A practical comparison of Zustand and Redux Toolkit for modern React apps — when to use each and why I chose Zustand for this project.",
    content: `
      <h2>The State Management Dilemma</h2>
      <p>Every non-trivial React app eventually hits the state management question. For years, Redux was the de-facto answer. In 2025, the landscape looks very different.</p>
      <h2>Zustand: Small but Mighty</h2>
      <p>Zustand is a <strong>bear-necessities</strong> state library — pun intended. No reducers, no action creators, no boilerplate. Just a store:</p>
      <pre><code>const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))</code></pre>
      <p>For my portfolio, Zustand handles the active section state and persists it to localStorage with the <code>persist</code> middleware — 10 lines total.</p>
      <h2>Redux Toolkit: Power for Complex Apps</h2>
      <p>RTK is fantastic when you need:</p>
      <ul>
        <li>Complex derived state with <strong>RTK Query</strong> for data fetching</li>
        <li>Time-travel debugging with Redux DevTools</li>
        <li>Large teams that benefit from enforced patterns</li>
      </ul>
      <h2>My Verdict</h2>
      <p>Use Zustand for personal projects and small-to-medium apps. Reach for RTK when you're building enterprise apps with complex async flows and need the full DevTools experience.</p>
    `,
    thumbnail:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80",
    category: "Technology",
    author: {
      name: "Agung Kurniawan",
      email: "agung@dev.com",
      type: "developer",
    },
    publishedAt: "2026-01-15T09:00:00.000Z",
    readingTime: 5,
    tags: ["React", "State Management", "Zustand"],
  },
  {
    id: "dev-003",
    title: "Tailwind CSS Tips That Will Level Up Your UI Game",
    excerpt:
      "10 practical Tailwind CSS techniques I use daily — from custom variants to performance tricks that keep your stylesheet lean.",
    content: `
      <h2>1. Use CSS Custom Properties as Design Tokens</h2>
      <p>Instead of hardcoding hex values everywhere, define them as CSS variables and map them in your Tailwind config. This enables themes that hot-swap without a single JS color object.</p>
      <h2>2. Group Variants for Readability</h2>
      <p>Tailwind's <code>group</code> and <code>peer</code> modifiers are underused. With <code>group-hover</code>, you can trigger child transitions from a parent hover — no JavaScript needed.</p>
      <h2>3. Arbitrary Values Sparingly</h2>
      <p>The <code>[value]</code> syntax is powerful but can become a design token graveyard. If you use the same arbitrary value three times, it's time to add it to your theme.</p>
      <blockquote><p>Consistency beats cleverness in design systems.</p></blockquote>
      <h2>4. Safelist Critical Classes</h2>
      <p>If you dynamically construct class names (e.g., from an API), Tailwind's purge will strip them. Use <code>safelist</code> or <code>content</code> array in config to preserve them.</p>
      <h2>5. Dark Mode with Class Strategy</h2>
      <p>Use <code>darkMode: 'class'</code> and pair it with <code>next-themes</code> for instant, flicker-free theme switching that respects the user's OS preference.</p>
    `,
    thumbnail:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80",
    category: "Tips & Tricks",
    author: {
      name: "Agung Kurniawan",
      email: "agung@dev.com",
      type: "developer",
    },
    publishedAt: "2026-02-10T10:00:00.000Z",
    readingTime: 4,
    tags: ["Tailwind CSS", "CSS", "Frontend"],
  },
  {
    id: "dev-004",
    title: "From Figma to Code: My Workflow for Pixel-Perfect UIs",
    excerpt:
      "How I bridge the gap between design and development — the tools, naming conventions, and processes that keep my workflow fast and consistent.",
    content: `
      <h2>Start with a Design System</h2>
      <p>Before writing a single line of code, I establish the design tokens: <strong>colors</strong>, <strong>spacing scale</strong>, <strong>typography</strong>, and <strong>shadows</strong>. These map 1:1 to my Tailwind config.</p>
      <h2>Figma Variables → CSS Custom Properties</h2>
      <p>Figma Variables (now stable) let you define the same tokens in design that you'll use in code. I export them and paste directly into <code>:root</code> and <code>.dark</code> selectors.</p>
      <h2>Component-Driven Development</h2>
      <p>I build in isolation — smallest components first, compose them upward. This prevents "global style creep" where a change in one place breaks three others.</p>
      <h2>The 8pt Grid</h2>
      <p>All spacing and sizing decisions are multiples of 8 (or 4 for micro-spacing). Tailwind's default spacing scale is already based on 4, making this effortless.</p>
      <ul>
        <li>Figma Auto Layout → Tailwind Flexbox/Grid</li>
        <li>Figma Effects → Tailwind box-shadow utilities</li>
        <li>Figma Text Styles → Tailwind typography plugin</li>
      </ul>
    `,
    thumbnail:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    category: "Design",
    author: {
      name: "Agung Kurniawan",
      email: "agung@dev.com",
      type: "developer",
    },
    publishedAt: "2026-02-25T08:30:00.000Z",
    readingTime: 6,
    tags: ["Figma", "UI/UX", "Design System"],
  },
]
