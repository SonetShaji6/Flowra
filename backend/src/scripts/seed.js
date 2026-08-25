const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const connectDB = require('../config/database');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const AIInteraction = require('../models/AIInteraction');
const { hashPassword } = require('../utils/password');

const seedData = async () => {
  try {
    console.log('🚀 Connecting to MongoDB for Flowra Database Seeding...');
    await connectDB();

    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Comment.deleteMany({}),
      Activity.deleteMany({}),
      Notification.deleteMany({}),
      AIInteraction.deleteMany({}),
    ]);
    console.log('✅ Collections cleared.');

    console.log('👤 Creating users...');
    const plainPassword = 'Password123!';

    const users = await User.create([
      {
        name: 'Alexander Vance',
        email: 'admin.root@flowra.app',
        password: plainPassword,
        role: 'ADMIN',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Sarah Jenkins',
        email: 'pm.sarah@flowra.app',
        password: plainPassword,
        role: 'PROJECT_MANAGER',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'David Chen',
        email: 'pm.david@flowra.app',
        password: plainPassword,
        role: 'PROJECT_MANAGER',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Alex Rivera',
        email: 'alex.dev@flowra.app',
        password: plainPassword,
        role: 'TEAM_MEMBER',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Elena Rostova',
        email: 'elena.dev@flowra.app',
        password: plainPassword,
        role: 'TEAM_MEMBER',
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Marcus Brody',
        email: 'marcus.design@flowra.app',
        password: plainPassword,
        role: 'TEAM_MEMBER',
        profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Sonet Shaji',
        email: 'sonet.lead@flowra.app',
        password: plainPassword,
        role: 'TEAM_MEMBER',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
    ]);

    const [admin, pmSarah, pmDavid, alexDev, elenaDev, marcusDesign, sonetLead] = users;
    console.log(`✅ Created ${users.length} users.`);

    console.log('📁 Creating projects...');
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const project1 = await Project.create({
      name: 'Flowra Next-Gen Cloud Platform',
      description: 'End-to-end agile workspace featuring real-time AI automation, Cloudinary integration, and interactive Kanban boards.',
      manager: pmSarah._id,
      members: [alexDev._id, elenaDev._id, marcusDesign._id, sonetLead._id],
      status: 'ACTIVE',
      priority: 'HIGH',
      progress: 65,
      startDate: new Date(now - 14 * day),
      deadline: new Date(now + 21 * day),
    });

    const project2 = await Project.create({
      name: 'AI Smart Risk & Sprint Optimizer',
      description: 'Google Gemini-powered engine for autonomous sprint backlog generation, task decomposition, and bottleneck prediction.',
      manager: pmSarah._id,
      members: [sonetLead._id, alexDev._id, elenaDev._id],
      status: 'ACTIVE',
      priority: 'CRITICAL',
      progress: 75,
      startDate: new Date(now - 10 * day),
      deadline: new Date(now + 15 * day),
    });

    const project3 = await Project.create({
      name: 'Mobile Workspace & iOS Native App',
      description: 'Native mobile client with offline-first caching, push notifications, and quick task capture for on-the-go teams.',
      manager: pmDavid._id,
      members: [marcusDesign._id, elenaDev._id, alexDev._id],
      status: 'PLANNING',
      priority: 'MEDIUM',
      progress: 20,
      startDate: new Date(now - 3 * day),
      deadline: new Date(now + 45 * day),
    });

    const project4 = await Project.create({
      name: 'Enterprise SSO & Security Hardening',
      description: 'SAML 2.0 / OAuth2 authentication, RBAC auditing, rate-limiting protections, and automated SAIF compliance.',
      manager: pmDavid._id,
      members: [alexDev._id, sonetLead._id],
      status: 'COMPLETED',
      priority: 'HIGH',
      progress: 100,
      startDate: new Date(now - 30 * day),
      deadline: new Date(now - 2 * day),
    });

    const project5 = await Project.create({
      name: 'Design System & Glassmorphism 2.0',
      description: 'Comprehensive UI component library with micro-animations, accessible color tokens, dark mode tokens, and fluid layout grids.',
      manager: pmSarah._id,
      members: [marcusDesign._id, elenaDev._id],
      status: 'ON_HOLD',
      priority: 'LOW',
      progress: 40,
      startDate: new Date(now - 20 * day),
      deadline: new Date(now + 30 * day),
    });

    const projects = [project1, project2, project3, project4, project5];
    console.log(`✅ Created ${projects.length} projects.`);

    console.log('📋 Creating tasks...');
    const tasksData = [
      // Project 1 Tasks (Flowra Next-Gen Cloud Platform)
      {
        project: project1._id,
        title: 'Architect Cloudinary Media Upload Pipeline',
        description: 'Implement multi-part buffer streaming to Cloudinary for avatars and task attachments with validation.',
        assignedTo: sonetLead._id,
        createdBy: pmSarah._id,
        priority: 'HIGH',
        status: 'COMPLETED',
        deadline: new Date(now - 1 * day),
        tags: ['Cloudinary', 'Backend', 'Media'],
        subtasks: [
          { title: 'Install multer and cloudinary SDK', isCompleted: true },
          { title: 'Build memory storage buffer pipeline', isCompleted: true },
          { title: 'Create /api/upload/avatar and /api/upload/attachment routes', isCompleted: true },
        ],
      },
      {
        project: project1._id,
        title: 'Implement Interactive Kanban Drag-and-Drop',
        description: 'Enable smooth drag-and-drop transitions between TODO, IN_PROGRESS, REVIEW, and COMPLETED columns with optimistic UI updates.',
        assignedTo: alexDev._id,
        createdBy: pmSarah._id,
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        deadline: new Date(now + 2 * day),
        tags: ['Frontend', 'Kanban', 'UI/UX'],
        subtasks: [
          { title: 'Build column containers with drop listeners', isCompleted: true },
          { title: 'Add drag state animation and visual placeholders', isCompleted: true },
          { title: 'Connect PATCH /api/tasks/:id/status API handler', isCompleted: false },
        ],
      },
      {
        project: project1._id,
        title: 'Build Modern High-Converting SaaS Landing Page',
        description: 'Design responsive landing page with Live Gemini AI Task Generator playground, interactive Kanban showcase, pricing matrix, and FAQ.',
        assignedTo: marcusDesign._id,
        createdBy: pmSarah._id,
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        deadline: new Date(now + 3 * day),
        tags: ['Landing Page', 'Design', 'Marketing'],
        subtasks: [
          { title: 'Hero section with interactive AI prompt sandbox', isCompleted: true },
          { title: 'Feature showcase and interactive pricing matrix', isCompleted: true },
          { title: 'Customer testimonials and FAQ accordion', isCompleted: false },
        ],
      },
      {
        project: project1._id,
        title: 'Real-time In-App Notification Center',
        description: 'Deliver instant notification badges when a task is assigned, commented on, or completed.',
        assignedTo: elenaDev._id,
        createdBy: pmSarah._id,
        priority: 'MEDIUM',
        status: 'REVIEW',
        deadline: new Date(now + 4 * day),
        tags: ['Notifications', 'Realtime'],
        subtasks: [
          { title: 'Create Notification Mongoose schema', isCompleted: true },
          { title: 'Build header notification bell dropdown', isCompleted: true },
          { title: 'Add Mark all as read action', isCompleted: true },
        ],
      },
      {
        project: project1._id,
        title: 'User Profile & Cloudinary Avatar Management',
        description: 'Allow users to customize their profile, upload a custom picture to Cloudinary, and update security credentials.',
        assignedTo: sonetLead._id,
        createdBy: pmSarah._id,
        priority: 'MEDIUM',
        status: 'TODO',
        deadline: new Date(now + 7 * day),
        tags: ['Profile', 'Cloudinary', 'Security'],
        subtasks: [
          { title: 'Avatar upload dropzone UI with live crop', isCompleted: false },
          { title: 'Password update validation check', isCompleted: false },
        ],
      },
      {
        project: project1._id,
        title: 'Comprehensive End-to-End API Integration Suite',
        description: 'Automate verification across all 51 RESTful endpoints to guarantee 100% test pass rate on every deployment.',
        assignedTo: alexDev._id,
        createdBy: pmSarah._id,
        priority: 'HIGH',
        status: 'COMPLETED',
        deadline: new Date(now - 3 * day),
        tags: ['Testing', 'QA', 'CI/CD'],
        subtasks: [
          { title: 'Write tests for auth, projects, tasks, and comments', isCompleted: true },
          { title: 'Add AI endpoints verification with live Gemini', isCompleted: true },
        ],
      },

      // Project 2 Tasks (AI Smart Risk & Sprint Optimizer)
      {
        project: project2._id,
        title: 'Integrate Google Gemini 3.6 Flash via @google/genai',
        description: 'Connect official Google Gen AI SDK for high-speed, structured JSON generation with system instruction guardrails.',
        assignedTo: sonetLead._id,
        createdBy: pmSarah._id,
        priority: 'CRITICAL',
        status: 'COMPLETED',
        deadline: new Date(now - 2 * day),
        tags: ['Gemini', 'AI', 'SDK'],
        subtasks: [
          { title: 'Configure @google/genai client with Gemini API key', isCompleted: true },
          { title: 'Implement structured JSON schema response parser', isCompleted: true },
          { title: 'Extract real-time token telemetry from usageMetadata', isCompleted: true },
        ],
      },
      {
        project: project2._id,
        title: 'Automated Sprint Task Decomposition Engine',
        description: 'Allow managers to input a single project requirement and receive 4-6 logically sequenced agile tasks.',
        assignedTo: elenaDev._id,
        createdBy: pmSarah._id,
        priority: 'HIGH',
        status: 'COMPLETED',
        deadline: new Date(now - 1 * day),
        tags: ['AI', 'Agile', 'Automation'],
        subtasks: [
          { title: 'Design prompt templates in prompt.service.js', isCompleted: true },
          { title: 'Build AIAssistantTab interactive generator UI', isCompleted: true },
          { title: 'Add Batch Task Creation from AI suggestions', isCompleted: true },
        ],
      },
      {
        project: project2._id,
        title: 'Intelligent Risk & Delivery Bottleneck Radar',
        description: 'Detect overdue deadlines, unassigned high-priority tasks, and resource overload using AI heuristics & Gemini analysis.',
        assignedTo: alexDev._id,
        createdBy: pmSarah._id,
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        deadline: new Date(now + 5 * day),
        tags: ['AI', 'Risks', 'Analytics'],
        subtasks: [
          { title: 'Scan overdue and unassigned task thresholds', isCompleted: true },
          { title: 'Generate concrete risk mitigation recommendations', isCompleted: true },
          { title: 'Render visual risk severity badges in dashboard', isCompleted: false },
        ],
      },
      {
        project: project2._id,
        title: 'Executive Project Health Summaries',
        description: 'One-click AI executive summaries assessing progress velocity, key milestones, and recommended next steps.',
        assignedTo: sonetLead._id,
        createdBy: pmSarah._id,
        priority: 'MEDIUM',
        status: 'REVIEW',
        deadline: new Date(now + 6 * day),
        tags: ['AI', 'Reporting', 'Executive'],
        subtasks: [
          { title: 'Aggregate project activities and task statistics', isCompleted: true },
          { title: 'Call Gemini project-summary endpoint', isCompleted: true },
          { title: 'Display health radar card in Project view', isCompleted: true },
        ],
      },

      // Project 3 Tasks (Mobile Workspace & iOS Native App)
      {
        project: project3._id,
        title: 'Mobile UX Wireframes & User Journey Mapping',
        description: 'Create interactive Figma prototypes for mobile task management, gesture-based status updates, and offline sync.',
        assignedTo: marcusDesign._id,
        createdBy: pmDavid._id,
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        deadline: new Date(now + 10 * day),
        tags: ['Mobile', 'Design', 'Figma'],
        subtasks: [
          { title: 'Design mobile bottom sheet for quick task creation', isCompleted: true },
          { title: 'Design swipe gesture controls for Kanban columns', isCompleted: false },
        ],
      },
      {
        project: project3._id,
        title: 'Setup React Native / Expo Project Architecture',
        description: 'Initialize cross-platform mobile repository with React Query, Tailwind native tokens, and secure token storage.',
        assignedTo: alexDev._id,
        createdBy: pmDavid._id,
        priority: 'MEDIUM',
        status: 'TODO',
        deadline: new Date(now + 14 * day),
        tags: ['Mobile', 'React Native'],
        subtasks: [
          { title: 'Configure TypeScript and linting rules', isCompleted: false },
          { title: 'Connect Flowra REST API client with JWT refresh', isCompleted: false },
        ],
      },
      {
        project: project3._id,
        title: 'Push Notification Gateway for iOS APNs & Android FCM',
        description: 'Configure Cloud Functions / Webhooks to trigger mobile push notifications upon task assignments.',
        assignedTo: elenaDev._id,
        createdBy: pmDavid._id,
        priority: 'LOW',
        status: 'TODO',
        deadline: new Date(now + 20 * day),
        tags: ['Mobile', 'Push Notifications'],
        subtasks: [],
      },

      // Project 4 Tasks (Enterprise SSO & Security Hardening)
      {
        project: project4._id,
        title: 'Implement Helmet Security Headers & CORS Guardrails',
        description: 'Enforce strict Content Security Policy, XSS protection, and whitelist allowed client origins.',
        assignedTo: alexDev._id,
        createdBy: pmDavid._id,
        priority: 'CRITICAL',
        status: 'COMPLETED',
        deadline: new Date(now - 10 * day),
        tags: ['Security', 'CORS', 'Backend'],
        subtasks: [
          { title: 'Add helmet middleware', isCompleted: true },
          { title: 'Configure dynamic CORS origin resolver', isCompleted: true },
        ],
      },
      {
        project: project4._id,
        title: 'Role-Based Access Control (RBAC) Enforcement',
        description: 'Verify ADMIN, PROJECT_MANAGER, and TEAM_MEMBER authorization boundaries across all project and user endpoints.',
        assignedTo: sonetLead._id,
        createdBy: pmDavid._id,
        priority: 'HIGH',
        status: 'COMPLETED',
        deadline: new Date(now - 8 * day),
        tags: ['Security', 'RBAC', 'Auth'],
        subtasks: [
          { title: 'Write role authorization middleware', isCompleted: true },
          { title: 'Protect admin user status toggles and system stats', isCompleted: true },
        ],
      },
      {
        project: project4._id,
        title: 'Bcrypt Password Hashing & Salt Round Optimization',
        description: 'Ensure 10-round salted bcrypt hashing for all stored credentials with strict password complexity requirements.',
        assignedTo: sonetLead._id,
        createdBy: pmDavid._id,
        priority: 'HIGH',
        status: 'COMPLETED',
        deadline: new Date(now - 6 * day),
        tags: ['Security', 'Cryptography'],
        subtasks: [
          { title: 'Add pre-save mongoose hook for password hashing', isCompleted: true },
          { title: 'Write unit tests in tests/password.test.js', isCompleted: true },
        ],
      },

      // Project 5 Tasks (Design System & Glassmorphism 2.0)
      {
        project: project5._id,
        title: 'Audit WCAG 2.1 AA Color Contrast Ratios',
        description: 'Verify all text and background tokens meet accessible color contrast standards across light and dark themes.',
        assignedTo: marcusDesign._id,
        createdBy: pmSarah._id,
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        deadline: new Date(now + 12 * day),
        tags: ['Design System', 'Accessibility', 'A11y'],
        subtasks: [
          { title: 'Audit teal and slate palette combinations', isCompleted: true },
          { title: 'Update button hover and focus ring styles', isCompleted: false },
        ],
      },
      {
        project: project5._id,
        title: 'Component Library Documentation in Storybook',
        description: 'Document Button, Input, Modal, Badge, KPICard, and Drawer components with interactive sandbox props.',
        assignedTo: elenaDev._id,
        createdBy: pmSarah._id,
        priority: 'LOW',
        status: 'TODO',
        deadline: new Date(now + 18 * day),
        tags: ['Design System', 'Storybook', 'Documentation'],
        subtasks: [],
      },
    ];

    const tasks = await Task.create(tasksData);
    console.log(`✅ Created ${tasks.length} tasks.`);

    console.log('💬 Creating comments...');
    const commentsData = [
      {
        task: tasks[0]._id,
        user: sonetLead._id,
        content: 'Cloudinary credentials configured and streaming pipeline tested! Both avatar uploads and task file attachments are working with zero local disk buffering.',
        createdAt: new Date(now - 1 * day),
      },
      {
        task: tasks[0]._id,
        user: pmSarah._id,
        content: 'Excellent work Sonet! Make sure we also have a delete endpoint to clean up orphaned media.',
        createdAt: new Date(now - 12 * 60 * 60 * 1000),
      },
      {
        task: tasks[1]._id,
        user: alexDev._id,
        content: 'The drag-and-drop animations feel super snappy. Finishing up the optimistic status sync now.',
        createdAt: new Date(now - 6 * 60 * 60 * 1000),
      },
      {
        task: tasks[2]._id,
        user: marcusDesign._id,
        content: 'Drafted the live interactive Gemini AI prompt sandbox on the landing page! Visitors can test generating task backlogs before signing up.',
        createdAt: new Date(now - 4 * 60 * 60 * 1000),
      },
      {
        task: tasks[6]._id,
        user: sonetLead._id,
        content: 'Gemini 3.6 Flash integration is blazing fast (~600ms latency) and reliably outputs strict JSON schemas without hallucinated formatting.',
        createdAt: new Date(now - 2 * day),
      },
    ];

    const comments = await Comment.create(commentsData);
    console.log(`✅ Created ${comments.length} comments.`);

    console.log('⚡ Creating activity logs...');
    const activitiesData = [
      {
        project: project1._id,
        user: pmSarah._id,
        action: 'PROJECT_CREATED',
        entityType: 'PROJECT',
        entityId: project1._id,
        details: { name: project1.name },
        createdAt: new Date(now - 14 * day),
      },
      {
        project: project1._id,
        user: sonetLead._id,
        action: 'TASK_COMPLETED',
        entityType: 'TASK',
        entityId: tasks[0]._id,
        details: { title: tasks[0].title },
        createdAt: new Date(now - 1 * day),
      },
      {
        project: project2._id,
        user: sonetLead._id,
        action: 'TASK_COMPLETED',
        entityType: 'TASK',
        entityId: tasks[6]._id,
        details: { title: tasks[6].title },
        createdAt: new Date(now - 2 * day),
      },
      {
        project: project2._id,
        user: elenaDev._id,
        action: 'TASK_COMPLETED',
        entityType: 'TASK',
        entityId: tasks[7]._id,
        details: { title: tasks[7].title },
        createdAt: new Date(now - 1 * day),
      },
      {
        project: project1._id,
        user: alexDev._id,
        action: 'TASK_UPDATED',
        entityType: 'TASK',
        entityId: tasks[1]._id,
        details: { status: 'IN_PROGRESS' },
        createdAt: new Date(now - 6 * 60 * 60 * 1000),
      },
      {
        project: project1._id,
        user: marcusDesign._id,
        action: 'COMMENT_ADDED',
        entityType: 'TASK',
        entityId: tasks[2]._id,
        details: { comment: 'Drafted the live interactive Gemini AI prompt sandbox' },
        createdAt: new Date(now - 4 * 60 * 60 * 1000),
      },
    ];

    const activities = await Activity.create(activitiesData);
    console.log(`✅ Created ${activities.length} activity entries.`);

    console.log('🔔 Creating user notifications...');
    const notificationsData = [
      {
        recipient: sonetLead._id,
        sender: pmSarah._id,
        type: 'ASSIGNMENT',
        title: 'New Task Assigned',
        message: 'Sarah Jenkins assigned you to "User Profile & Cloudinary Avatar Management".',
        relatedProject: project1._id,
        relatedTask: tasks[4]._id,
        isRead: false,
        createdAt: new Date(now - 2 * 60 * 60 * 1000),
      },
      {
        recipient: alexDev._id,
        sender: pmSarah._id,
        type: 'ASSIGNMENT',
        title: 'High Priority Task Assigned',
        message: 'You have been assigned to "Implement Interactive Kanban Drag-and-Drop".',
        relatedProject: project1._id,
        relatedTask: tasks[1]._id,
        isRead: false,
        createdAt: new Date(now - 5 * 60 * 60 * 1000),
      },
      {
        recipient: pmSarah._id,
        sender: sonetLead._id,
        type: 'TASK_UPDATE',
        title: 'Task Completed',
        message: 'Sonet Shaji marked "Integrate Google Gemini 3.6 Flash" as COMPLETED.',
        relatedProject: project2._id,
        relatedTask: tasks[6]._id,
        isRead: true,
        createdAt: new Date(now - 1 * day),
      },
      {
        recipient: elenaDev._id,
        sender: pmSarah._id,
        type: 'PROJECT_UPDATE',
        title: 'Project Milestone Reached',
        message: 'Flowra Next-Gen Cloud Platform has crossed 65% completion progress.',
        relatedProject: project1._id,
        isRead: true,
        createdAt: new Date(now - 2 * day),
      },
    ];

    const notifications = await Notification.create(notificationsData);
    console.log(`✅ Created ${notifications.length} notifications.`);

    console.log('🤖 Creating AI interaction history logs...');
    const aiInteractionsData = [
      {
        user: pmSarah._id,
        project: project2._id,
        type: 'TASK_GENERATION',
        prompt: JSON.stringify({
          projectName: 'AI Smart Risk & Sprint Optimizer',
          goal: 'Automate sprint task decomposition and bottleneck radar',
        }),
        response: {
          tasks: [
            {
              title: 'Implement Prompt Engineering Pipeline for Gemini',
              description: 'Create strict JSON schema prompts for task generation and decomposition.',
              priority: 'HIGH',
            },
            {
              title: 'Build Live AI Assistant Tab in Project Details',
              description: 'Interactive UI allowing project managers to generate sprint tasks in one click.',
              priority: 'HIGH',
            },
          ],
        },
        tokensUsed: 462,
        createdAt: new Date(now - 2 * day),
      },
      {
        user: pmSarah._id,
        project: project1._id,
        type: 'HEALTH_SUMMARY',
        prompt: JSON.stringify({
          projectName: 'Flowra Next-Gen Cloud Platform',
          progress: 65,
        }),
        response: {
          healthStatus: 'ON_TRACK',
          summary: 'Flowra Next-Gen Cloud Platform is advancing on schedule with strong developer velocity across Cloudinary media uploads and Kanban interface.',
          keyHighlights: [
            'Media pipeline and authentication infrastructure complete',
            'Kanban drag-and-drop actively in development',
            'Zero critical blockers reported',
          ],
        },
        tokensUsed: 388,
        createdAt: new Date(now - 1 * day),
      },
    ];

    const aiInteractions = await AIInteraction.create(aiInteractionsData);
    console.log(`✅ Created ${aiInteractions.length} AI interaction logs.`);

    console.log('\n=============================================');
    console.log('🎉 FLOWRA DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================');
    console.log('Test Accounts Available:');
    console.log('1. Admin:           admin.root@flowra.app   / Password123!');
    console.log('2. Project Manager: pm.sarah@flowra.app     / Password123!');
    console.log('3. Project Manager: pm.david@flowra.app     / Password123!');
    console.log('4. Team Member:     alex.dev@flowra.app     / Password123!');
    console.log('5. Team Member:     elena.dev@flowra.app    / Password123!');
    console.log('6. Team Member:     marcus.design@flowra.app/ Password123!');
    console.log('7. Team Member:     sonet.lead@flowra.app   / Password123!');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  }
};

seedData();
