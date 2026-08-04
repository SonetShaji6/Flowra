# Flowra — Design System

This document maps out the design system, styling specifications, and component tokens for Flowra's **Minimal Teal + White SaaS Design**.

---

## 1. Design Tokens

### Color Palette

Flowra prioritizes a crisp, high-contrast, professional aesthetic. Color is utilized intentionally to denote actions and states rather than as general background noise.

| Token | CSS Variable | Hex Value | Purpose / Application |
| :--- | :--- | :---: | :--- |
| **Primary Teal** | `--color-teal-700` | `#0F766E` | Brand color. Main call-to-actions, active navigation states, primary buttons, and focus borders. |
| **Secondary Teal** | `--color-teal-500` | `#14B8A6` | Accent color. Interactive hover states, secondary highlights, checkmarks, and positive indicators. |
| **Light Teal** | `--color-teal-50` | `#CCFBF1` | Wash color. Selected sidebar backgrounds, success badges, and information notices. |
| **Background** | `--color-bg-white` | `#FFFFFF` | Primary canvas. Dashboard bodies, content panels, text inputs, and table fields. |
| **Surface** | `--color-bg-surface`| `#F8FAFC` | Container canvas. Sidebar background, hover list cards, details panels, and header bar. |
| **Text Primary** | `--color-text-dark` | `#0F172A` | Primary readability. Headers, title links, navigation labels, and standard text. |
| **Text Secondary**| `--color-text-muted`| `#475569` | Metadata & labels. Sub-headers, captions, timestamps, and input placeholders. |
| **Border** | `--color-border` | `#E2E8F0` | Structural dividers. Subtle containers, table rows, button outlines, and card borders. |

### Semantic Indicators

Semantic colors are applied sparingly to avoid visual noise.

* **Success (Completed):** `#16A34A` (Green)
* **Warning (Risk/On Hold):** `#D97706` (Amber)
* **Error (Overdue/Urgent):** `#DC2626` (Red)
* **Info (Planning/Neutral):** `#2563EB` (Blue)

---

## 2. Typography

The default typography family is **Inter** (a highly legible, modern geometric sans-serif optimized for screens).

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### Typography Scale

| Token Name | Weight | Font Size | Line Height | Purpose / Usage |
| :--- | :---: | :--- | :--- | :--- |
| `Display` | 700 (Bold) | `2.25rem` (36px) | `2.75rem` | High-impact promotional headers, stats counters |
| `H1` | 700 (Bold) | `1.875rem` (30px)| `2.25rem` | Major dashboard pages, screen headings |
| `H2` | 600 (Semibold)| `1.5rem` (24px) | `1.875rem` | Container card groups, sidebar headers |
| `H3` | 600 (Semibold)| `1.25rem` (20px) | `1.625rem` | Table headers, list sections, detail drawers |
| `Body` | 400 (Regular) | `1.0rem` (16px) | `1.5rem` | Workspace body text, chat text, input contents |
| `Small` | 500 (Medium) | `0.875rem` (14px)| `1.25rem` | Sidebar labels, table rows, button labels |
| `Caption` | 400 (Regular) | `0.75rem` (12px) | `1.0rem` | Timestamps, metadata lines, error helper text |

---

## 3. Spacing & Grid System

All padding, margins, and gaps operate on an 8px (0.5rem) logical grid to enforce layout alignment.

* `space-1` = `0.25rem` (4px)
* `space-2` = `0.5rem` (8px)
* `space-3` = `0.75rem` (12px)
* `space-4` = `1.0rem` (16px) — *Standard card padding*
* `space-6` = `1.5rem` (24px) — *Standard page gap / spacing*
* `space-8` = `2.0rem` (32px)
* `space-12` = `3.0rem` (48px)

---

## 4. Reusable UI Component Inventory

To maintain modular code, the frontend structures layout using a standardized component library:

### Layout
* `Sidebar`: Desktop left navigation dock containing site menus, team links, and settings.
* `Header`: Top bar hosting search inputs, notification center (bell icon), and profile dropdown.
* `MobileNavigation`: Slide-out menu panel for tablet and mobile viewports.

### Navigation
* `Breadcrumbs`: Path indicator showing location context (e.g., `Projects / Flowra / Tasks`).
* `Tabs`: Sub-navigation links inside screens (e.g., Overview, Tasks, Team, Activity, Analytics).
* `Pagination`: Clean numbered layout controls for long table navigation.

### Data Display
* `DataTable`: Highly structured data grid featuring sortable header columns, pagination, and clean teal-border borders.
* `ProjectCard`: Standard outline container showcasing project name, deadline, priority badge, and completion slider.
* `TaskCard`: Minimalist block containing task title, assignee avatar, priority badge, and subtask completion ratio.
* `UserCard`: Standardized list element showing member name, email, avatar, and project responsibility.
* `ActivityItem`: Chronological feed item showing author avatar, action description, and timestamp.

### Forms
* `Input`: Minimal text field utilizing subtle outline borders (`#E2E8F0`) that transition to teal (`#0F766E`) on focus.
* `Select`: Custom dropdown menus for status, priority, and role selection.
* `DatePicker`: Clean calendar selection widget with custom teal styling.
* `Textarea`: Multi-line text field for descriptions and commenting.
* `FormField`: Flex box combining input fields, titles, and validation error messages.

### Feedback
* `Modal`: Central pop-up frame with backdrop blur and white surface background.
* `Dialog`: Confirmation prompt overlay (e.g., deleting a project, committing a task).
* `Toast`: Temporary bottom-right notifications (success, error, information).
* `Alert`: Inline warning/error blocks.
* `EmptyState`: Visually clean, centered illustration with action buttons (shown when tables or tasks are empty).
* `LoadingState`: Skeleton card block loader that moves in a subtle pulsing gradient.

### AI Assistant UI
* `AIMessage`: Structured response bubble differentiating user prompts from AI suggestions.
* `AIActionCard`: Interactive checkbox block holding AI-generated items (e.g., proposed subtasks).
* `SuggestionList`: Toggle-ready list showcasing priority ideas or risks with easy checkmarks.
* `AIInsightCard`: Highlighted dashboard component hosting AI bottleneck warnings.

### Analytics
* `KPICard`: Minimal indicator containing stat numeric value, trend arrow, and title label.
* `ProgressBar`: Visual teal gauge tracking project completions: `(Completed Tasks / Total Tasks) * 100`.
* `ChartCard`: Responsive container wrapping Recharts graphs.
