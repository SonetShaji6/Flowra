const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/database');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');
const Comment = require('../src/models/Comment');
const Notification = require('../src/models/Notification');
const Activity = require('../src/models/Activity');

const results = [];

function recordTest(moduleName, endpoint, method, authRole, expected, actual, status, notes = '') {
  results.push({
    module: moduleName,
    endpoint,
    method,
    auth: authRole,
    expected,
    actual,
    status: status ? 'PASS' : 'FAIL',
    notes,
  });
  const color = status ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}[${status ? 'PASS' : 'FAIL'}]\x1b[0m ${moduleName} - ${method} ${endpoint} -> Expected ${expected}, Got ${actual}`);
}

async function runVerification() {
  console.log('\n========================================');
  console.log('FLOWRA WEEK 3 - COMPLETE API VERIFICATION');
  console.log('========================================\n');

  await connectDB();
  console.log('Connected to Database successfully.\n');

  const testSuffix = Date.now();
  let adminToken, pmToken, memberToken;
  let adminUser, pmUser, memberUser;
  let testProject, testTask, testComment, testNotification;

  try {
    // 0. HEALTH CHECK
    {
      const res = await request(app).get('/api/health');
      recordTest('Health', '/api/health', 'GET', 'None', 200, res.status, res.status === 200);
    }

    // 1. AUTHENTICATION
    {
      // Admin creation
      adminUser = await User.create({
        name: `Admin Test ${testSuffix}`,
        email: `admin_${testSuffix}@flowra.test`,
        password: 'Password123!',
        role: 'ADMIN',
      });

      const adminLogin = await request(app).post('/api/auth/login').send({
        email: `admin_${testSuffix}@flowra.test`,
        password: 'Password123!',
      });
      adminToken = adminLogin.body.token;
      recordTest('Auth', '/api/auth/login (Admin)', 'POST', 'None', 200, adminLogin.status, adminLogin.status === 200);

      // Register PM
      const pmReg = await request(app).post('/api/auth/register').send({
        name: `PM Test ${testSuffix}`,
        email: `pm_${testSuffix}@flowra.test`,
        password: 'Password123!',
        role: 'PROJECT_MANAGER',
      });
      pmToken = pmReg.body.token;
      pmUser = pmReg.body.data;
      recordTest('Auth', '/api/auth/register (PM)', 'POST', 'None', 201, pmReg.status, pmReg.status === 201);

      // Register Team Member
      const memberReg = await request(app).post('/api/auth/register').send({
        name: `Member Test ${testSuffix}`,
        email: `member_${testSuffix}@flowra.test`,
        password: 'Password123!',
        role: 'TEAM_MEMBER',
      });
      memberToken = memberReg.body.token;
      memberUser = memberReg.body.data;
      recordTest('Auth', '/api/auth/register (Member)', 'POST', 'None', 201, memberReg.status, memberReg.status === 201);

      // Register Duplicate Email (Failure)
      const dupReg = await request(app).post('/api/auth/register').send({
        name: 'Dup User',
        email: `pm_${testSuffix}@flowra.test`,
        password: 'Password123!',
      });
      recordTest('Auth', '/api/auth/register (Duplicate)', 'POST', 'None', 409, dupReg.status, dupReg.status === 409);

      // Login Invalid Password (Failure)
      const badLogin = await request(app).post('/api/auth/login').send({
        email: `pm_${testSuffix}@flowra.test`,
        password: 'WrongPassword!',
      });
      recordTest('Auth', '/api/auth/login (Bad Password)', 'POST', 'None', 401, badLogin.status, badLogin.status === 401);

      // Get Me
      const getMe = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${pmToken}`);
      recordTest('Auth', '/api/auth/me', 'GET', 'Auth', 200, getMe.status, getMe.status === 200);

      // Get Me Unauthorized (Failure)
      const unauthMe = await request(app).get('/api/auth/me');
      recordTest('Auth', '/api/auth/me (No Token)', 'GET', 'None', 401, unauthMe.status, unauthMe.status === 401);

      // Logout
      const logoutRes = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${pmToken}`);
      recordTest('Auth', '/api/auth/logout', 'POST', 'Auth', 200, logoutRes.status, logoutRes.status === 200);
    }

    // 2. USER & PROFILE MANAGEMENT
    {
      const profile = await request(app).get('/api/users/me').set('Authorization', `Bearer ${pmToken}`);
      recordTest('Users', '/api/users/me', 'GET', 'Auth', 200, profile.status, profile.status === 200);

      const updateProfile = await request(app).patch('/api/users/me').set('Authorization', `Bearer ${pmToken}`).send({
        name: `PM Updated ${testSuffix}`,
      });
      recordTest('Users', '/api/users/me', 'PATCH', 'Auth', 200, updateProfile.status, updateProfile.status === 200);

      const updatePwd = await request(app).patch('/api/users/me/password').set('Authorization', `Bearer ${pmToken}`).send({
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
      });
      recordTest('Users', '/api/users/me/password', 'PATCH', 'Auth', 200, updatePwd.status, updatePwd.status === 200);

      // Reset password back for consistency
      await request(app).patch('/api/users/me/password').set('Authorization', `Bearer ${pmToken}`).send({
        currentPassword: 'NewPassword123!',
        newPassword: 'Password123!',
      });

      const listUsers = await request(app).get('/api/users').set('Authorization', `Bearer ${pmToken}`);
      recordTest('Users', '/api/users', 'GET', 'Auth', 200, listUsers.status, listUsers.status === 200);

      const getUser = await request(app).get(`/api/users/${memberUser.id}`).set('Authorization', `Bearer ${pmToken}`);
      recordTest('Users', '/api/users/:id', 'GET', 'Auth', 200, getUser.status, getUser.status === 200);
    }

    // 3. PROJECT MANAGEMENT
    {
      const createProj = await request(app).post('/api/projects').set('Authorization', `Bearer ${pmToken}`).send({
        name: `College Event Management ${testSuffix}`,
        description: 'AI-powered campus fest and hackathon management platform.',
        priority: 'HIGH',
        status: 'ACTIVE',
      });
      testProject = createProj.body.data;
      recordTest('Projects', '/api/projects', 'POST', 'PM', 201, createProj.status, createProj.status === 201);

      // Unauthorized Project Creation by Team Member (Failure)
      const unauthProj = await request(app).post('/api/projects').set('Authorization', `Bearer ${memberToken}`).send({
        name: 'Member Proj',
        description: 'Should fail with 403',
      });
      recordTest('Projects', '/api/projects (Member Create)', 'POST', 'Member', 403, unauthProj.status, unauthProj.status === 403);

      const listProj = await request(app).get('/api/projects').set('Authorization', `Bearer ${pmToken}`);
      recordTest('Projects', '/api/projects', 'GET', 'Auth', 200, listProj.status, listProj.status === 200);

      const getProj = await request(app).get(`/api/projects/${testProject._id}`).set('Authorization', `Bearer ${pmToken}`);
      recordTest('Projects', '/api/projects/:id', 'GET', 'Auth', 200, getProj.status, getProj.status === 200);

      const updateProj = await request(app).patch(`/api/projects/${testProject._id}`).set('Authorization', `Bearer ${pmToken}`).send({
        priority: 'CRITICAL',
      });
      recordTest('Projects', '/api/projects/:id', 'PATCH', 'PM', 200, updateProj.status, updateProj.status === 200);
    }

    // 4. TEAM & MEMBER MANAGEMENT
    {
      const addMember = await request(app).post(`/api/projects/${testProject._id}/members`).set('Authorization', `Bearer ${pmToken}`).send({
        userId: memberUser.id,
      });
      recordTest('Team', '/api/projects/:id/members', 'POST', 'PM', 200, addMember.status, addMember.status === 200);

      const duplicateMember = await request(app).post(`/api/projects/${testProject._id}/members`).set('Authorization', `Bearer ${pmToken}`).send({
        userId: memberUser.id,
      });
      recordTest('Team', '/api/projects/:id/members (Duplicate)', 'POST', 'PM', 400, duplicateMember.status, duplicateMember.status === 400);

      const listMembers = await request(app).get(`/api/projects/${testProject._id}/members`).set('Authorization', `Bearer ${pmToken}`);
      recordTest('Team', '/api/projects/:id/members', 'GET', 'Auth', 200, listMembers.status, listMembers.status === 200);
    }

    // 5. TASK MANAGEMENT
    {
      const createTask = await request(app).post('/api/tasks').set('Authorization', `Bearer ${pmToken}`).send({
        project: testProject._id,
        title: `Design Landing Page ${testSuffix}`,
        description: 'Create responsive hero section, ticket tier table, and schedule viewer.',
        assignedTo: memberUser.id,
        priority: 'HIGH',
        status: 'TODO',
        subtasks: [
          { title: 'Hero banner UI', isCompleted: false },
          { title: 'Registration modal', isCompleted: false },
        ],
      });
      testTask = createTask.body.data;
      recordTest('Tasks', '/api/tasks', 'POST', 'PM', 201, createTask.status, createTask.status === 201);

      const listTasks = await request(app).get(`/api/tasks?project=${testProject._id}`).set('Authorization', `Bearer ${pmToken}`);
      recordTest('Tasks', '/api/tasks?project=:id', 'GET', 'Auth', 200, listTasks.status, listTasks.status === 200);

      const filterTasks = await request(app).get('/api/tasks?status=TODO&priority=HIGH').set('Authorization', `Bearer ${pmToken}`);
      recordTest('Tasks', '/api/tasks?status=TODO', 'GET', 'Auth', 200, filterTasks.status, filterTasks.status === 200);

      const searchTasks = await request(app).get('/api/tasks?search=Landing').set('Authorization', `Bearer ${pmToken}`);
      recordTest('Tasks', '/api/tasks?search=Landing', 'GET', 'Auth', 200, searchTasks.status, searchTasks.status === 200);

      const getTask = await request(app).get(`/api/tasks/${testTask._id}`).set('Authorization', `Bearer ${pmToken}`);
      recordTest('Tasks', '/api/tasks/:id', 'GET', 'Auth', 200, getTask.status, getTask.status === 200);

      const updateTaskStatus = await request(app).patch(`/api/tasks/${testTask._id}/status`).set('Authorization', `Bearer ${memberToken}`).send({
        status: 'IN_PROGRESS',
      });
      recordTest('Tasks', '/api/tasks/:id/status (IN_PROGRESS)', 'PATCH', 'Auth', 200, updateTaskStatus.status, updateTaskStatus.status === 200);

      const completeTaskStatus = await request(app).patch(`/api/tasks/${testTask._id}/status`).set('Authorization', `Bearer ${memberToken}`).send({
        status: 'COMPLETED',
      });
      recordTest('Tasks', '/api/tasks/:id/status (COMPLETED)', 'PATCH', 'Auth', 200, completeTaskStatus.status, completeTaskStatus.status === 200);

      // Verify Project Progress calculation auto-sync
      const projCheck = await request(app).get(`/api/projects/${testProject._id}`).set('Authorization', `Bearer ${pmToken}`);
      recordTest('Projects', 'Progress Calculation Check (100%)', 'GET', 'Auth', 100, projCheck.body.data.progress, projCheck.body.data.progress === 100);
    }

    // 6. COLLABORATION & COMMENTS
    {
      const createComment = await request(app).post('/api/comments').set('Authorization', `Bearer ${memberToken}`).send({
        task: testTask._id,
        project: testProject._id,
        content: 'Completed the hero banner and registration modal with responsive tests.',
      });
      testComment = createComment.body.data;
      recordTest('Comments', '/api/comments', 'POST', 'Auth', 201, createComment.status, createComment.status === 201);

      const listComments = await request(app).get(`/api/comments?taskId=${testTask._id}`).set('Authorization', `Bearer ${pmToken}`);
      recordTest('Comments', '/api/comments?taskId=:id', 'GET', 'Auth', 200, listComments.status, listComments.status === 200);

      const updateComment = await request(app).patch(`/api/comments/${testComment._id}`).set('Authorization', `Bearer ${memberToken}`).send({
        content: 'Updated comment: all responsive tests passing.',
      });
      recordTest('Comments', '/api/comments/:id', 'PATCH', 'Auth', 200, updateComment.status, updateComment.status === 200);

      const getActivities = await request(app).get(`/api/activities/project/${testProject._id}`).set('Authorization', `Bearer ${pmToken}`);
      recordTest('Activities', '/api/activities/project/:id', 'GET', 'Auth', 200, getActivities.status, getActivities.status === 200);

      const listAllActivities = await request(app).get('/api/activities').set('Authorization', `Bearer ${pmToken}`);
      recordTest('Activities', '/api/activities', 'GET', 'Auth', 200, listAllActivities.status, listAllActivities.status === 200);
    }

    // 7. NOTIFICATIONS
    {
      const getNotifications = await request(app).get('/api/notifications').set('Authorization', `Bearer ${pmToken}`);
      recordTest('Notifications', '/api/notifications', 'GET', 'Auth', 200, getNotifications.status, getNotifications.status === 200);

      const readAllNotifs = await request(app).patch('/api/notifications/read-all').set('Authorization', `Bearer ${pmToken}`);
      recordTest('Notifications', '/api/notifications/read-all', 'PATCH', 'Auth', 200, readAllNotifs.status, readAllNotifs.status === 200);
    }

    // 8. AI PROJECT ASSISTANT
    {
      const genTasks = await request(app).post('/api/ai/generate-tasks').set('Authorization', `Bearer ${pmToken}`).send({
        projectId: testProject._id,
        goal: 'Implement automated QR code check-in and certificate distribution.',
      });
      recordTest('AI', '/api/ai/generate-tasks', 'POST', 'Auth', 200, genTasks.status, genTasks.status === 200 && genTasks.body.data.tasks.length > 0);

      const breakdownTask = await request(app).post('/api/ai/breakdown-task').set('Authorization', `Bearer ${pmToken}`).send({
        taskId: testTask._id,
        title: 'Build Certificate Generator',
      });
      recordTest('AI', '/api/ai/breakdown-task', 'POST', 'Auth', 200, breakdownTask.status, breakdownTask.status === 200 && breakdownTask.body.data.subtasks.length > 0);

      const projSummary = await request(app).post('/api/ai/project-summary').set('Authorization', `Bearer ${pmToken}`).send({
        projectId: testProject._id,
      });
      recordTest('AI', '/api/ai/project-summary', 'POST', 'Auth', 200, projSummary.status, projSummary.status === 200 && Boolean(projSummary.body.data.summary));

      const riskAnalysis = await request(app).post('/api/ai/risk-analysis').set('Authorization', `Bearer ${pmToken}`).send({
        projectId: testProject._id,
      });
      recordTest('AI', '/api/ai/risk-analysis', 'POST', 'Auth', 200, riskAnalysis.status, riskAnalysis.status === 200 && Array.isArray(riskAnalysis.body.data.risks));
    }

    // 9. DASHBOARD & ANALYTICS
    {
      const overviewAnalytics = await request(app).get('/api/analytics/overview').set('Authorization', `Bearer ${pmToken}`);
      recordTest('Analytics', '/api/analytics/overview', 'GET', 'Auth', 200, overviewAnalytics.status, overviewAnalytics.status === 200);

      const projAnalytics = await request(app).get(`/api/analytics/projects/${testProject._id}`).set('Authorization', `Bearer ${pmToken}`);
      recordTest('Analytics', '/api/analytics/projects/:id', 'GET', 'Auth', 200, projAnalytics.status, projAnalytics.status === 200);

      const teamAnalytics = await request(app).get('/api/analytics/team').set('Authorization', `Bearer ${pmToken}`);
      recordTest('Analytics', '/api/analytics/team', 'GET', 'Auth', 200, teamAnalytics.status, teamAnalytics.status === 200);
    }

    // 10. ADMIN & SYSTEM MANAGEMENT
    {
      const adminStats = await request(app).get('/api/admin/statistics').set('Authorization', `Bearer ${adminToken}`);
      recordTest('Admin', '/api/admin/statistics', 'GET', 'Admin', 200, adminStats.status, adminStats.status === 200);

      const nonAdminStats = await request(app).get('/api/admin/statistics').set('Authorization', `Bearer ${pmToken}`);
      recordTest('Admin', '/api/admin/statistics (Forbidden for PM)', 'GET', 'PM', 403, nonAdminStats.status, nonAdminStats.status === 403);

      const adminUsers = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${adminToken}`);
      recordTest('Admin', '/api/admin/users', 'GET', 'Admin', 200, adminUsers.status, adminUsers.status === 200);

      const adminProjects = await request(app).get('/api/admin/projects').set('Authorization', `Bearer ${adminToken}`);
      recordTest('Admin', '/api/admin/projects', 'GET', 'Admin', 200, adminProjects.status, adminProjects.status === 200);

      const adminActivities = await request(app).get('/api/admin/activities').set('Authorization', `Bearer ${adminToken}`);
      recordTest('Admin', '/api/admin/activities', 'GET', 'Admin', 200, adminActivities.status, adminActivities.status === 200);

      const toggleStatus = await request(app).patch(`/api/users/${memberUser.id}/status`).set('Authorization', `Bearer ${adminToken}`).send({
        isActive: true,
      });
      recordTest('Admin', '/api/users/:id/status', 'PATCH', 'Admin', 200, toggleStatus.status, toggleStatus.status === 200);

      const toggleRole = await request(app).patch(`/api/users/${memberUser.id}/role`).set('Authorization', `Bearer ${adminToken}`).send({
        role: 'TEAM_MEMBER',
      });
      recordTest('Admin', '/api/users/:id/role', 'PATCH', 'Admin', 200, toggleRole.status, toggleRole.status === 200);
    }

    // Cleanup & Summary
    console.log('\n========================================');
    const total = results.length;
    const passed = results.filter((r) => r.status === 'PASS').length;
    const failed = total - passed;
    console.log(`TOTAL ENDPOINT TESTS: ${total}`);
    console.log(`PASSED: \x1b[32m${passed}\x1b[0m`);
    console.log(`FAILED: \x1b[31m${failed}\x1b[0m`);
    console.log('========================================\n');

    // Clean up created records
    if (testProject) {
      await Task.deleteMany({ project: testProject._id });
      await Comment.deleteMany({ project: testProject._id });
      await Activity.deleteMany({ project: testProject._id });
      await Notification.deleteMany({ relatedProject: testProject._id });
      await Project.deleteOne({ _id: testProject._id });
    }
    if (adminUser) await User.deleteOne({ _id: adminUser._id });
    if (pmUser) await User.deleteOne({ _id: pmUser.id });
    if (memberUser) await User.deleteOne({ _id: memberUser.id });

    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal Verification Error:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

runVerification();
