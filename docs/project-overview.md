# Flowra — Project Overview

## 1. Product Identity

* **Product Name:** Flowra
* **Tagline:** *Where Projects Flow.*
* **Product Type:** AI-Powered Project Management Platform
* **Primary Target Audience:** Software teams, project managers, and organizations seeking an intuitive project management experience supercharged with context-aware AI.

---

## 2. Rationale & Vision

Modern project management tools are often divided into two extremes:
1. **Overwhelming & Text-Heavy:** Platforms like Jira provide deep functionality but are plagued by dense interfaces, visual clutter, and complex workflows that slow down team productivity.
2. **Overly Simplified:** Simple boards like basic Trello lack the necessary structure, analytics, and intelligent support required for complex development workflows.

**Flowra** sits precisely in the sweet spot. By utilizing a **Minimal Teal + White SaaS Design** combined with a native **AI Project Assistant**, Flowra removes visual noise and automates repetitive planning and analysis tasks. The platform feels "alive," responsive, and modern. 

The name **Flowra** combines "Flow" (the state of effortless productivity and seamless integration of work) and the suffix "-ra" (evoking light, aura, and clean energy). It signifies a space where tasks, communication, and AI insights converge into a singular, fluid motion.

---

## 3. Visual Identity & Design Direction

Flowra adheres strictly to a **Minimal Teal + White SaaS Design**. The design prioritizes visual clarity, high-contrast readability, generous whitespace, and purposeful accents.

### Design Tokens (Suggested Palette)
* **Primary Teal:** `#0F766E` (Deep teal used for primary brand accents, active states, and main interactive buttons)
* **Secondary Teal:** `#14B8A6` (Brighter teal for highlights, secondary interactive elements, and progressive hover states)
* **Light Teal:** `#CCFBF1` (Light background wash for selected sidebar items, badges, and positive alerts)
* **Background:** `#FFFFFF` (Pure white primary workspace background, ensuring maximum brightness and contrast)
* **Surface:** `#F8FAFC` (Cool slate-gray/white surface for sidebars, cards, and container boundaries)
* **Text Primary:** `#0F172A` (Deep slate-black for high contrast, modern readability, and professional look)
* **Text Secondary:** `#475569` (Medium slate-gray for captions, metadata, and descriptive text)
* **Border:** `#E2E8F0` (Subtle grey borders to structure layouts without creating hard visual blocks)

### Visual Principles
* **Generous Whitespace:** Spacing is used as a divider, rather than drawing heavy colored lines.
* **Soft Shadows:** Container elevations are subtle (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1)`), ensuring a modern, flat-yet-layered layout.
* **Consistent Border Radius:** Standardized `0.375rem (6px)` or `0.5rem (8px)` rounded corners across cards, buttons, inputs, and modals.
* **No Visual Noise:** No unnecessary decorative patterns, heavy gradients, or glowing glassmorphism. It is a tool for high-focus work.

---

## 4. Key Pillars

Flowra is built on three fundamental pillars that differentiate it from traditional PM tools:

### I. The "SaaS Shell" Layout
A standardized, responsive side-navigation dashboard that operates seamlessly on mobile and desktop. It is optimized for high information density without clutter, displaying projects, team workloads, active tasks, and real-time activities in structured tables and cards.

### II. Context-Aware AI Project Assistant
Unlike standard chatbots, Flowra's AI assistant is deeply aware of the specific project database. It doesn't just answer questions; it generates multi-level task breakdowns, detects deadline risks, identifies team workload bottlenecks, and summarizes project health. All AI suggestions require user confirmation before execution, keeping the human operator in control.

### III. Professional Role-Based Experience
Flowra provides tailored experiences for three core roles:
* **Admin:** System monitoring, user activation/deactivation, platform statistics, global permissions.
* **Project Manager:** Project creation, task allocation, timeline scheduling, team workload balancing, risk analysis.
* **Team Member:** Focused personal dashboard, task status updates, collaboration feeds, personal analytics.

---

## 5. Technology Stack (MERN)

Flowra is engineered using the industry-standard MERN stack:
* **Frontend:** React (TypeScript), Tailwind CSS (for structural layout) and Vanilla CSS (for strict brand theme alignment), React Router, TanStack Query, Lucide React, and Recharts.
* **Backend:** Node.js, Express, and Mongoose (MongoDB ODM).
* **AI Engine:** Node-based integration with OpenAI or DeepSeek services, structured to protect secrets on the backend and serve JSON schemas to the UI.
