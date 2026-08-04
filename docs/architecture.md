# Flowra — System Architecture

This document describes the high-level architecture, data flow, and structural patterns of the Flowra platform.

---

## 1. High-Level Architecture (MERN + AI)

Flowra follows a decoupled **Client-Server** architecture.

```text
    ┌─────────────────────────┐
    │     React Frontend      │ (Vercel)
    │   (Minimal Teal UI)     │
    └───────────┬─────────────┘
                │
                │ HTTP / REST / JWT
                ▼
    ┌─────────────────────────┐
    │    Node.js / Express    │ (Render)
    │      Backend API        │
    └─────┬──────────┬────────┘
          │          │
          │          │
          ▼          ▼
    ┌───────────┐  ┌───────────┐
    │  MongoDB  │  │    AI     │ (OpenAI / DeepSeek)
    │  (Atlas)  │  │  Service  │
    └───────────┘  └───────────┘
```

---

## 2. Component Layers

### Frontend Layer (React)
* **View:** Functional components using Tailwind CSS for layout and Vanilla CSS for brand-specific Teal styling.
* **Logic:** Custom Hooks (via TanStack Query) managing API state and synchronization.
* **State:** Zustand for global authentication state and UI-specific toggles.
* **Router:** React Router handling protected access and deep-linking to specific projects/tasks.

### Backend Layer (Node.js/Express)
* **Controller:** Handles incoming HTTP requests, orchestrating logic between models and services.
* **Service:** Encapsulates complex business logic, specifically the **AI Service** which formats prompts for the LLM.
* **Model:** Mongoose schemas defining the structure and validation of the MongoDB documents.
* **Middleware:** Handles JWT verification, role-based authorization, request logging, and global error handling.

### Data Layer (MongoDB)
* **Persistence:** Document-oriented storage in MongoDB Atlas.
* **Integrity:** Schema-level validation and transaction-like cascade logic handled in the Node.js application layer.

---

## 3. The AI Data Flow

Flowra's AI interactions follow a strict **"User-in-the-Loop"** pattern:

1. **Prompt Generation:** The User or PM requests an action (e.g., "Generate Tasks").
2. **Context Hydration:** The Backend fetches relevant project metadata (current tasks, deadline, team) to provide "few-shot" context to the LLM.
3. **Inference:** The Backend calls the AI Provider and receives a structured JSON or Markdown response.
4. **Interactive Review:** The Frontend renders this response as an interactive checklist.
5. **Commit:** The user modifies/approves the items. Only then does the Frontend send a `POST` request to create the final records in the MongoDB collections.

---

## 4. Key Design Patterns

* **Repository/Service Pattern:** Decouples API controllers from the specific AI or Database logic.
* **Observer/Event Pattern:** Used for Notifications. A task update "emits" an event that triggers the creation of Notification documents for relevant users.
* **SaaS Shell Pattern:** A consistent, responsive layout wrapper ensuring the "Where Projects Flow" aesthetic remains uniform across all modules.
