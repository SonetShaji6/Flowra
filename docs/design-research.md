# Flowra — Design Research

This document captures UX and architectural patterns from leading project management platforms, highlighting how Flowra adapts these concepts into its **Minimal Teal + White SaaS Design**.

---

## 1. Linear

### Useful UX Pattern
* Keyboard-first navigation, hyper-clean layouts, and highly streamlined status workflows.
* Keyboard shortcut mappings (e.g., `C` for Create, `Esc` to close details panel).

### Why It Is Useful
* Speeds up power-user operations.
* Minimizes visual noise by avoiding large text descriptions and unnecessary border lines.
* Keeps the interface distraction-free, encouraging extreme developer focus.

### How Flowra Will Adapt It
* Flowra will adapt the clean typography and strict status indicator patterns (subtle hollow/solid circles for task states).
* We will support global keyboard-driven shortcuts (e.g., press `Alt + A` to open the AI Project Assistant) and design an aesthetic with thin borders and extensive breathing room.

---

## 2. Jira

### Useful UX Pattern
* Deep, granular issue details, detailed parent-child subtask hierarchies, and extensive workflow controls.

### Why It Is Useful
* Allows large enterprise teams to organize highly complex projects, supporting rich compliance tracking and comprehensive data density.

### How Flowra Will Adapt It
* Jira's multi-layered structure is highly powerful but notoriously cluttered. Flowra will adapt the **concept** of subtask checklists and detailed task audit logs but will present them in a streamlined, simplified side-drawer format.
* Rather than rendering dozens of fields on a screen, Flowra hides secondary details (like metadata logs or subtask lists) inside a collapsible right-hand panel, keeping the primary task title and description front and center.

---

## 3. Trello

### Useful UX Pattern
* Drag-and-drop Kanban card layout for task state visualization.

### Why It Is Useful
* Extremely intuitive for non-technical users.
* Provides immediate visual understanding of project workload distributions and task blockages.

### How Flowra Will Adapt It
* Flowra will feature a dual view: a clean List View for high-density analysis and a Kanban Board View.
* Flowra's Kanban board will adopt Trello's drag-and-drop tactile response but styling-wise will align with the Minimal Teal + White direction, featuring thin, border-only cards, and removing background column clutter.

---

## 4. Asana

### Useful UX Pattern
* Project-level Tabbed Layout (List, Board, Timeline, Team, Calendar, Files).

### Why It Is Useful
* Allows different team members to view the identical dataset through their preferred layout lens. For example, developers might prefer Kanban, while PMs prefer timelines.

### How Flowra Will Adapt It
* Flowra will implement a structured Tabbed interface for its Project Overview screen:
  `Overview` | `Tasks` | `Team` | `Activity` | `Analytics` | `AI Assistant`
* Switching tabs changes only the main nested content block without triggering full-page browser reloads, utilizing React's state router.

---

## 5. ClickUp

### Useful UX Pattern
* High-density KPI cards, aggregated team workload graphs, and granular personal dashboards.

### Why It Is Useful
* Consolidates complex team availability metrics and task numbers into digestible, high-level dashboards for executive stakeholders.

### How Flowra Will Adapt It
* ClickUp dashboards are often visually overwhelming. Flowra will filter this noise down to 4 critical KPI indicators (Total Projects, Active Projects, Pending Tasks, and Overdue Tasks).
* We will adapt the team workload indicator by rendering a clean, minimal, non-cluttered horizontal bar chart displaying active tasks per developer.

---

## 6. Notion

### Useful UX Pattern
* Slash-command inputs and inline interactive checklist triggers.

### Why It Is Useful
* Removes form fatigue by allowing users to document ideas and create action items contextually in real-time, within a single workspace block.

### How Flowra Will Adapt It
* While Flowra won't build a complete rich-text editor, the **AI Assistant** interface will adapt Notion's interactive checklist paradigm.
* When the AI parses a user's project goals, it outputs an interactive checklist. Users can selectively check or uncheck individual items, modifying names inline before committing them to the database, giving users total editor control.
