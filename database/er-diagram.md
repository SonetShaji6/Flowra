# Flowra — Entity Relationship (ER) Diagram

This document contains a text-visual representation of Flowra's MongoDB collections and their schema connections using Mermaid format.

---

## 1. ER Diagram (Mermaid)

```mermaid
erDiagram
    User ||--o{ Project : "manages"
    User ||--o{ ProjectMember : "belongs to"
    User ||--o{ Task : "assigned to"
    User ||--o{ Task : "creates"
    User ||--o{ Comment : "writes"
    User ||--o{ Activity : "generates"
    User ||--o{ Notification : "receives"
    User ||--o{ AIInteraction : "requests"
    User ||--o{ RefreshToken : "possesses"
    User ||--o{ PasswordReset : "requests"

    Project ||--o{ ProjectMember : "has"
    Project ||--o{ Task : "contains"
    Project ||--o{ Comment : "has comments"
    Project ||--o{ Activity : "records logs"
    Project ||--o{ AIInteraction : "contextualizes"

    ProjectMember {
        ObjectId user_id FK
        String responsibility
        Date joinedAt
    }

    Task ||--o{ Comment : "has comments"
    Task ||--o{ Activity : "records state changes"
    Task ||--o{ Notification : "triggers alerts"

    User {
        ObjectId _id PK
        String name
        String email UK
        String password
        String profileImage
        String role "ADMIN | PROJECT_MANAGER | TEAM_MEMBER"
        Boolean isActive
        Date createdAt
        Date updatedAt
    }

    Project {
        ObjectId _id PK
        String name
        String description
        ObjectId manager FK "points to User"
        ProjectMember members
        Date startDate
        Date deadline
        String status "PLANNING | IN_PROGRESS | ON_HOLD | COMPLETED | CANCELLED"
        String priority "LOW | MEDIUM | HIGH"
        Number progress
        Date createdAt
        Date updatedAt
    }

    Task {
        ObjectId _id PK
        ObjectId project FK "points to Project"
        String title
        String description
        ObjectId assignedTo FK "points to User"
        ObjectId createdBy FK "points to User"
        String priority "LOW | MEDIUM | HIGH"
        String status "TODO | IN_PROGRESS | REVIEW | COMPLETED"
        Date deadline
        Subtask subtasks "embedded array"
        Date createdAt
        Date updatedAt
    }

    Subtask {
        String title
        Boolean isCompleted
    }

    Comment {
        ObjectId _id PK
        ObjectId user FK "points to User"
        ObjectId project FK "points to Project"
        ObjectId task FK "points to Task"
        String content
        ObjectId parentComment FK "points to self (Comment)"
        Date createdAt
    }

    Activity {
        ObjectId _id PK
        ObjectId user FK "points to User"
        ObjectId project FK "points to Project"
        ObjectId task FK "points to Task"
        String action
        Object metadata "embedded data"
        Date createdAt
    }

    Notification {
        ObjectId _id PK
        ObjectId recipient FK "points to User"
        String type "TASK_ASSIGNED | DEADLINE_REMINDER | MENTION | SYSTEM"
        String title
        String message
        ObjectId relatedProject FK
        ObjectId relatedTask FK
        Boolean isRead
        Date createdAt
    }

    AIInteraction {
        ObjectId _id PK
        ObjectId user FK "points to User"
        ObjectId project FK "points to Project"
        String type "TASK_GENERATION | TASK_BREAKDOWN | PRIORITY_SUGGESTION | RISK_DETECTION | SUMMARY"
        String prompt
        String response "Markdown or Raw Output"
        Object generatedTasks "Structured array of planned tasks"
        Object metadata
        Date createdAt
    }

    RefreshToken {
        ObjectId _id PK
        ObjectId user FK "points to User"
        String token UK
        Date expiresAt
        Date createdAt
    }

    PasswordReset {
        ObjectId _id PK
        ObjectId user FK "points to User"
        String token UK
        Date expiresAt
        Date createdAt
    }
```
