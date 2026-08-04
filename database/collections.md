# Flowra — MongoDB Collections & Mongoose Schemas

This document contains detailed definitions of Mongoose schema configurations, validators, enums, options, and relationships for Flowra.

---

## 1. User Collection (`users`)

* **Schema File Location:** `backend/models/User.js`

```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Automatically exclude password from read queries for security
  },
  profileImage: {
    type: String,
    default: 'https://res.cloudinary.com/flowra/image/upload/v1/avatars/default.png'
  },
  role: {
    type: String,
    enum: {
      values: ['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER'],
      message: 'Role must be either ADMIN, PROJECT_MANAGER, or TEAM_MEMBER'
    },
    default: 'TEAM_MEMBER'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Auto-manages createdAt and updatedAt
});
```

---

## 2. Project Collection (`projects`)

* **Schema File Location:** `backend/models/Project.js`

```javascript
const projectMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  responsibility: {
    type: String,
    required: true,
    default: 'Developer'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [projectMemberSchema],
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  deadline: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'Deadline cannot be before the start date'
    }
  },
  status: {
    type: String,
    enum: ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'],
    default: 'PLANNING'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});
```

---

## 3. Task Collection (`tasks`)

* **Schema File Location:** `backend/models/Task.js`

```javascript
const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [150, 'Task title cannot exceed 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Task can be initially unassigned
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'],
    default: 'TODO'
  },
  deadline: {
    type: Date,
    required: true
  },
  subtasks: [subtaskSchema]
}, {
  timestamps: true
});
```

---

## 4. Comment Collection (`comments`)

* **Schema File Location:** `backend/models/Comment.js`

```javascript
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null // If null, comment is posted directly at the general Project level
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null // Enables 2-level deep replies (Comment -> Reply)
  }
}, {
  timestamps: true
});
```

---

## 5. Activity Collection (`activities`)

* **Schema File Location:** `backend/models/Activity.js`

```javascript
const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  action: {
    type: String,
    required: true,
    // Example: 'PROJECT_CREATED', 'TASK_COMPLETED', 'MEMBER_ADDED', 'STATUS_CHANGED'
  },
  metadata: {
    type: mongoose.Schema.Types.Map,
    of: mongoose.Schema.Types.Mixed, // Holds action-specific metrics: { oldStatus: 'TODO', newStatus: 'IN_PROGRESS' }
    default: {}
  }
}, {
  timestamps: { createdAt: true, updatedAt: false } // Only createdAt is required for historical logs
});
```

---

## 6. Notification Collection (`notifications`)

* **Schema File Location:** `backend/models/Notification.js`

```javascript
const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['TASK_ASSIGNED', 'DEADLINE_REMINDER', 'NEW_COMMENT', 'PROJECT_INVITE', 'STATUS_UPDATE'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: true, updatedAt: true }
});
```

---

## 7. AI Interaction Collection (`aiInteractions`)

* **Schema File Location:** `backend/models/AIInteraction.js`

```javascript
const aiInteractionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  type: {
    type: String,
    enum: ['TASK_GENERATION', 'TASK_BREAKDOWN', 'PRIORITY_SUGGESTION', 'PROJECT_SUMMARY', 'RISK_DETECTION'],
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true // Renders raw response or markdown in assistant chat feed
  },
  generatedTasks: [
    {
      title: { type: String, required: true },
      description: { type: String },
      priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' }
    }
  ],
  metadata: {
    tokensUsed: Number,
    modelUsed: String,
    latencyMs: Number
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});
```

---

## 8. Refresh Token Collection (`refreshTokens`)

* **Schema File Location:** `backend/models/RefreshToken.js`

```javascript
const refreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Auto-delete token documents from database when expired (TTL index)
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

---

## 9. Password Reset Collection (`passwordResets`)

* **Schema File Location:** `backend/models/PasswordReset.js`

```javascript
const passwordResetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 3600000) // 1 hour recovery window
  }
}, {
  timestamps: true
});

passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```
