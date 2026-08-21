const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');
const Comment = require('../src/models/Comment');
const Notification = require('../src/models/Notification');
const Activity = require('../src/models/Activity');
const AIInteraction = require('../src/models/AIInteraction');
const connectDB = require('../src/config/database');

jest.setTimeout(30000);

describe('Flowra 10-Module API Comprehensive Test Suite', () => {
  let adminToken;
  let pmToken;
  let memberToken;
  let adminUser;
  let pmUser;
  let memberUser;
  let testProject;
  let testTask;
  let testComment;
  let testNotification;

  const testSuffix = Date.now();

  beforeAll(async () => {
    await connectDB();

    // Clean up any test users with same prefix
    await User.deleteMany({ email: new RegExp(`test_.*_${testSuffix}@flowra.test`) });

    // 1. Create Admin
    adminUser = await User.create({
      name: `Admin User ${testSuffix}`,
      email: `test_admin_${testSuffix}@flowra.test`,
      password: 'Password123!',
      role: 'ADMIN',
    });

    // 2. Register PM
    const pmRegRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: `PM User ${testSuffix}`,
        email: `test_pm_${testSuffix}@flowra.test`,
        password: 'Password123!',
        role: 'PROJECT_MANAGER',
      });
    pmToken = pmRegRes.body.token;
    pmUser = pmRegRes.body.data;

    // 3. Register Team Member
    const memberRegRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: `Dev User ${testSuffix}`,
        email: `test_member_${testSuffix}@flowra.test`,
        password: 'Password123!',
        role: 'TEAM_MEMBER',
      });
    memberToken = memberRegRes.body.token;
    memberUser = memberRegRes.body.data;

    // Login as Admin
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: `test_admin_${testSuffix}@flowra.test`,
        password: 'Password123!',
      });
    adminToken = adminLoginRes.body.token;
  }, 30000);

  afterAll(async () => {
    // Cleanup created test resources
    if (testProject) {
      await Task.deleteMany({ project: testProject._id });
      await Comment.deleteMany({ project: testProject._id });
      await Activity.deleteMany({ project: testProject._id });
      await Notification.deleteMany({ relatedProject: testProject._id });
      await AIInteraction.deleteMany({ project: testProject._id });
      await Project.deleteOne({ _id: testProject._id });
    }
    if (adminUser) await User.deleteOne({ _id: adminUser._id });
    if (pmUser) await User.deleteOne({ _id: pmUser.id });
    if (memberUser) await User.deleteOne({ _id: memberUser.id });

    await mongoose.connection.close();
  }, 30000);

  // Health
  describe('Health Check Endpoint', () => {
    it('GET /api/health - should return 200 OK', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/Flowra API is running/i);
    });
  });

  // Module 1: Auth & Authorization
  describe('Module 1: Authentication & Authorization', () => {
    it('POST /api/auth/login - should log in successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: `test_pm_${testSuffix}@flowra.test`,
          password: 'Password123!',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('POST /api/auth/login [Failure] - should reject invalid password with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: `test_pm_${testSuffix}@flowra.test`,
          password: 'WrongPassword!',
        });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/register [Failure] - should reject duplicate email with 409', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate User',
          email: `test_pm_${testSuffix}@flowra.test`,
          password: 'Password123!',
        });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me - should return current user profile with token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${pmToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(`test_pm_${testSuffix}@flowra.test`);
    });

    it('GET /api/auth/me [Failure] - should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  // Module 2: User & Profile Management
  describe('Module 2: User & Profile Management', () => {
    it('GET /api/users/me - should get user profile', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${pmToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toContain('PM User');
    });

    it('PATCH /api/users/me - should update profile name', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ name: `PM User Updated ${testSuffix}` });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe(`PM User Updated ${testSuffix}`);
    });

    it('GET /api/users - should retrieve active users list', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${pmToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // Module 3: Project Management
  describe('Module 3: Project Management', () => {
    it('POST /api/projects - should create a project with PM role', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          name: `Flowra Project ${testSuffix}`,
          description: 'A comprehensive project management test project with AI features.',
          priority: 'HIGH',
          status: 'ACTIVE',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe(`Flowra Project ${testSuffix}`);
      expect(res.body.data.progress).toBe(0);
      testProject = res.body.data;
    });

    it('POST /api/projects [Failure] - should reject creation by unauthorized TEAM_MEMBER with 403', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          name: `Unauthorized Project ${testSuffix}`,
          description: 'This should not be allowed for team members.',
        });
      expect(res.status).toBe(403);
    });

    it('GET /api/projects - should return user projects', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${pmToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some(p => p._id === testProject._id)).toBe(true);
    });

    it('GET /api/projects/:id - should get project details', async () => {
      const res = await request(app)
        .get(`/api/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${pmToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(testProject._id);
    });

    it('PATCH /api/projects/:id - should update project details', async () => {
      const res = await request(app)
        .patch(`/api/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ priority: 'CRITICAL' });
      expect(res.status).toBe(200);
      expect(res.body.data.priority).toBe('CRITICAL');
    });
  });

  // Module 4: Team & Member Management
  describe('Module 4: Team & Member Management', () => {
    it('POST /api/projects/:id/members - should add member to project', async () => {
      const res = await request(app)
        .post(`/api/projects/${testProject._id}/members`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ userId: memberUser.id });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('POST /api/projects/:id/members [Failure] - should reject adding already existing member with 400', async () => {
      const res = await request(app)
        .post(`/api/projects/${testProject._id}/members`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ userId: memberUser.id });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already a member/i);
    });

    it('GET /api/projects/:id/members - should list project members', async () => {
      const res = await request(app)
        .get(`/api/projects/${testProject._id}/members`)
        .set('Authorization', `Bearer ${pmToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.members).toBeDefined();
    });
  });

  // Module 5: Task Management
  describe('Module 5: Task Management', () => {
    it('POST /api/tasks - should create a task with subtasks', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          project: testProject._id,
          title: `Build Authentication Flow ${testSuffix}`,
          description: 'Implement JWT login, signup, and protected routes.',
          assignedTo: memberUser.id,
          priority: 'HIGH',
          status: 'TODO',
          subtasks: [
            { title: 'Create login screen', isCompleted: false },
            { title: 'Setup auth token cookie', isCompleted: false },
          ],
        });
      expect(res.status).toBe(201);
      expect(res.body.data.title).toContain('Build Authentication Flow');
      testTask = res.body.data;
    });

    it('GET /api/tasks - should filter tasks by status and search', async () => {
      const res = await request(app)
        .get(`/api/tasks?status=TODO&search=Authentication`)
        .set('Authorization', `Bearer ${pmToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/tasks/:id - should retrieve task details', async () => {
      const res = await request(app)
        .get(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${pmToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(testTask._id);
    });

    it('PATCH /api/tasks/:id/status - should update status to IN_PROGRESS', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${testTask._id}/status`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'IN_PROGRESS' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });

    it('PATCH /api/tasks/:id/status - should update status to COMPLETED and sync project progress to 100%', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${testTask._id}/status`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'COMPLETED' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COMPLETED');

      // Verify project progress updated
      const projRes = await request(app)
        .get(`/api/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${pmToken}`);
      expect(projRes.body.data.progress).toBe(100);
    });
  });

  // Module 6: Collaboration & Comments
  describe('Module 6: Collaboration & Comments', () => {
    it('POST /api/comments - should create a comment on task', async () => {
      const res = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          task: testTask._id,
          project: testProject._id,
          content: 'Implemented and tested the authentication endpoints with 100% pass rate.',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.content).toContain('authentication endpoints');
      testComment = res.body.data;
    });

    it('GET /api/comments - should retrieve comments for task', async () => {
      const res = await request(app)
        .get(`/api/comments?taskId=${testTask._id}`)
        .set('Authorization', `Bearer ${pmToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/activities/project/:id - should return project activities', async () => {
      const res = await request(app)
        .get(`/api/activities/project/${testProject._id}`)
        .set('Authorization', `Bearer ${pmToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // Module 7: Notifications
  describe('Module 7: Notifications', () => {
    it('GET /api/notifications - should return notifications for user', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${memberToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.notifications).toBeDefined();
      expect(res.body.data.unreadCount).toBeGreaterThanOrEqual(0);
      if (res.body.data.notifications.length > 0) {
        testNotification = res.body.data.notifications[0];
      }
    });

    it('PATCH /api/notifications/read-all - should mark all user notifications as read', async () => {
      const res = await request(app)
        .patch('/api/notifications/read-all')
        .set('Authorization', `Bearer ${memberToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // Module 8: AI Project Assistant
  describe('Module 8: AI Project Assistant', () => {
    it('POST /api/ai/generate-tasks - should return structured task suggestions', async () => {
      const res = await request(app)
        .post('/api/ai/generate-tasks')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          projectId: testProject._id,
          goal: 'Build an automated college event management system with ticket booking.',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.tasks).toBeDefined();
      expect(Array.isArray(res.body.data.tasks)).toBe(true);
      expect(res.body.data.tasks.length).toBeGreaterThanOrEqual(3);
    });

    it('POST /api/ai/breakdown-task - should generate subtask breakdown', async () => {
      const res = await request(app)
        .post('/api/ai/breakdown-task')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          taskId: testTask._id,
          title: 'Implement QR Code Ticket Scanner',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.subtasks).toBeDefined();
      expect(Array.isArray(res.body.data.subtasks)).toBe(true);
    });

    it('POST /api/ai/project-summary - should generate contextual project summary', async () => {
      const res = await request(app)
        .post('/api/ai/project-summary')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ projectId: testProject._id });
      expect(res.status).toBe(200);
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.healthStatus).toBeDefined();
    });

    it('POST /api/ai/risk-analysis - should perform project risk analysis', async () => {
      const res = await request(app)
        .post('/api/ai/risk-analysis')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ projectId: testProject._id });
      expect(res.status).toBe(200);
      expect(res.body.data.risks).toBeDefined();
      expect(Array.isArray(res.body.data.risks)).toBe(true);
    });
  });

  // Module 9: Analytics
  describe('Module 9: Dashboard & Analytics', () => {
    it('GET /api/analytics/overview - should return global overview metrics', async () => {
      const res = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${pmToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.overview.totalProjects).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/analytics/projects/:id - should return project specific analytics', async () => {
      const res = await request(app)
        .get(`/api/analytics/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${pmToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.metrics.totalTasks).toBeGreaterThanOrEqual(1);
      expect(res.body.data.statusDistribution).toBeDefined();
    });

    it('GET /api/analytics/team - should return team workload breakdown', async () => {
      const res = await request(app)
        .get('/api/analytics/team')
        .set('Authorization', `Bearer ${pmToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // Module 10: Admin & System Management
  describe('Module 10: Admin & System Management', () => {
    it('GET /api/admin/statistics - should return system health and totals for ADMIN', async () => {
      const res = await request(app)
        .get('/api/admin/statistics')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('healthy');
      expect(res.body.data.users.total).toBeGreaterThanOrEqual(3);
    });

    it('GET /api/admin/statistics [Failure] - should reject non-admin with 403', async () => {
      const res = await request(app)
        .get('/api/admin/statistics')
        .set('Authorization', `Bearer ${pmToken}`);
      expect(res.status).toBe(403);
    });

    it('GET /api/admin/users - should return all users list for admin', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/admin/projects - should return system wide projects for admin', async () => {
      const res = await request(app)
        .get('/api/admin/projects')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/admin/activities - should return system activities stream for admin', async () => {
      const res = await request(app)
        .get('/api/admin/activities')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
