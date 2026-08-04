# Flowra — Database Design Overview

This document presents the database selection, modeling rationale, relationship mappings, and data integrity designs for Flowra.

---

## 1. Core Database Choice: MongoDB

Flowra is developed on the **MERN** (MongoDB, Express, React, Node.js) stack, utilizing **MongoDB** as its primary data store.

### Key Architectural Rationale
1. **Dynamic Schema for AI Outputs:** The **AI Project Assistant** returns complex, structured, variable JSON objects (checklists, subtask grids, risk profiles, priority analysis). MongoDB allows storing these raw nested items naturally inside an `aiInteractions` collection without requiring rigid tabular migrations.
2. **Document Nesting for Speed:** Small, logically coupled structures like task checklists (`subtasks`) can be embedded directly within the parent `Task` document. This eliminates the necessity of running SQL joins for everyday checklists, decreasing database latency.
3. **Subtle Relationships via DBRef ObjectIds:** While MongoDB is a NoSQL store, we leverage Mongoose `Schema.Types.ObjectId` references (`ref`) to structure relational dependencies (e.g., matching tasks to projects, and comments to authors).
4. **Horizontal Scaling Capability:** Project management platforms grow rapidly in write volume (logs, events, ticks, notifications). MongoDB Atlas supports easy sharding and horizontal scaling.

---

## 2. Document Modeling Strategy

Flowra adopts a **Hybrid Schema Model** balancing normalization (linking documents with ObjectIds) and denormalization (embedding sub-documents).

### When We Reference (Normalized)
We use references (`ref`) when the child entities need to be queried independently or exist across multiple contexts:
* **Users:** Projects, Tasks, Comments, and Activities refer to User IDs. We do not copy complete User profiles into cards to ensure user detail changes (e.g., avatar updates) propagate system-wide instantly.
* **Projects:** Tasks refer to Projects. Keeping Projects as distinct parent documents prevents individual project documents from breaching MongoDB's 16MB single-document limit as task counts grow.
* **Comments:** Referenced to their parent Task or Project, keeping comments isolated from core task structures to optimize board-rendering speed.

### When We Embed (Denormalized)
We embed structures when the child data is tightly scoped to the parent document and is rarely queried independently:
* **Task Checklist Subtasks:** Since subtasks are strictly scoped to a single Task and are always viewed in that specific task context, we embed them as an array of sub-documents:
  `subtasks: [ { title: String, isCompleted: Boolean } ]`
* **Comment Replies:** Nested replies are embedded within parent Comment documents up to 2 levels deep, allowing comments and their replies to load in a single query.
* **Activity Metadata:** Key audit parameters (e.g., old status, new status) are stored as embedded sub-documents within the audit event record.

---

## 3. Reference Maps & Cascading Deletes

### Cascade Logic
Because MongoDB does not enforce foreign key constraints natively, cascading deletes and referential checks are managed programmatically via Mongoose middleware:
* **Project Deletion:** When a `Project` is deleted, pre-remove Mongoose hooks run queries to clean up dependent collections:
  * Delete all `Tasks` where `project = projectId`.
  * Delete all `Comments` where `project = projectId`.
  * Delete all `Activities` where `project = projectId`.
  * Delete all `Notifications` where `relatedProject = projectId`.
* **User Deactivation:** To maintain audit histories, deleting users is discouraged. Instead, we use an `isActive: false` flag. If a user profile is deactivated, their assignments remain visible, but login attempts are blocked, preserving historical database logs.
