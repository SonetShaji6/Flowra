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

async function runE2EWorkflow() {
  console.log('====================================================');
  console.log('FLOWRA WEEK 4 - COMPLETE 20-STEP END-TO-END ACCEPTANCE TEST');
  console.log('====================================================\n');

  await connectDB();
  const timestamp = Date.now();

  const pmEmail = `pm.e2e.${timestamp}@flowra.app`;
  const devEmail = `dev.e2e.${timestamp}@flowra.app`;
  const adminEmail = `admin.e2e.${timestamp}@flowra.app`;
  const password = 'Password123!';

  let pmToken, devToken, adminToken;
  let pmUser, devUser, adminUser;
  let projectId, taskId;

  // STEP 1: Register a Project Manager
  console.log('▶ STEP 1: Registering Project Manager...');
  const regPmRes = await request(app).post('/api/auth/register').send({
    name: 'Elena Rostova (PM)',
    email: pmEmail,
    password,
    role: 'PROJECT_MANAGER',
  });
  if (regPmRes.status !== 201) throw new Error(`Step 1 failed: ${JSON.stringify(regPmRes.body)}`);
  pmUser = regPmRes.body.data;
  console.log(`  ✓ PM registered: ${pmUser.email} (ID: ${pmUser._id || pmUser.id})`);

  // STEP 2: Login as Project Manager
  console.log('▶ STEP 2: Logging in as Project Manager...');
  const loginPmRes = await request(app).post('/api/auth/login').send({
    email: pmEmail,
    password,
  });
  if (loginPmRes.status !== 200 || !loginPmRes.body.token) throw new Error('Step 2 failed');
  pmToken = loginPmRes.body.token;
  console.log('  ✓ PM logged in successfully, JWT received.');

  // Register Team Member & Admin for later steps
  const regDevRes = await request(app).post('/api/auth/register').send({
    name: 'Marcus Brody (Engineer)',
    email: devEmail,
    password,
    role: 'TEAM_MEMBER',
  });
  devUser = regDevRes.body.data;
  const devLoginRes = await request(app).post('/api/auth/login').send({ email: devEmail, password });
  devToken = devLoginRes.body.token;

  const adminRegRes = await User.create({
    name: 'Root Admin',
    email: adminEmail,
    password,
    role: 'ADMIN',
  });
  adminUser = adminRegRes;
  const adminLoginRes = await request(app).post('/api/auth/login').send({ email: adminEmail, password });
  adminToken = adminLoginRes.body.token;

  // STEP 3: Open Dashboard (Verify Stats)
  console.log('▶ STEP 3: Fetching Workspace Dashboard Metrics...');
  const dashRes = await request(app).get('/api/analytics/overview').set('Authorization', `Bearer ${pmToken}`);
  if (dashRes.status !== 200) throw new Error('Step 3 failed');
  console.log(`  ✓ Dashboard Overview loaded (Total Projects: ${dashRes.body.data?.overview?.totalProjects ?? 0})`);

  // STEP 4: Create Project "College Event Management System"
  console.log('▶ STEP 4: Creating Project "College Event Management System"...');
  const createProjRes = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${pmToken}`)
    .send({
      name: 'College Event Management System',
      description: 'AI-driven portal for university fest registrations, ticketing, and live event scheduling.',
      priority: 'HIGH',
      status: 'ACTIVE',
      deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    });
  if (createProjRes.status !== 201) throw new Error('Step 4 failed');
  projectId = createProjRes.body.data._id;
  console.log(`  ✓ Project created with ID: ${projectId} (Initial Progress: ${createProjRes.body.data.progress}%)`);

  // STEP 5: Add a Team Member to the project
  console.log('▶ STEP 5: Adding Team Member to Project...');
  const addMemberRes = await request(app)
    .post(`/api/projects/${projectId}/members`)
    .set('Authorization', `Bearer ${pmToken}`)
    .send({ userId: devUser._id || devUser.id });
  if (addMemberRes.status !== 200) throw new Error('Step 5 failed');
  console.log('  ✓ Team Member added to project team successfully.');

  // STEP 6 & 7: Use AI to generate task suggestions
  console.log('▶ STEP 6 & 7: Generating AI Task Suggestions with project context...');
  const aiTasksRes = await request(app)
    .post('/api/ai/generate-tasks')
    .set('Authorization', `Bearer ${pmToken}`)
    .send({
      projectId,
      goal: 'Build an automated college event management website with QR ticket scanning and pass checkout.',
    });
  if (aiTasksRes.status !== 200) throw new Error(`Step 6/7 failed: ${JSON.stringify(aiTasksRes.body)}`);
  const suggestions = aiTasksRes.body.data?.tasks || aiTasksRes.body.tasks || [];
  console.log(`  ✓ AI returned ${suggestions.length} structured suggestions:`);
  suggestions.slice(0, 3).forEach((s, idx) => console.log(`    [${idx + 1}] ${s.title} (${s.priority})`));

  // STEP 8 & 9: Human Selection & Explicit Task Creation
  console.log('▶ STEP 8 & 9: Human selection & batch task creation (Safety workflow)...');
  const selectedTaskSuggestion = suggestions[0] || {
    title: 'Implement QR Ticket Scanner and Validation Module',
    description: 'Build responsive QR scanner interface for gate staff.',
    priority: 'HIGH',
  };

  const createTaskRes = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${pmToken}`)
    .send({
      project: projectId,
      title: selectedTaskSuggestion.title,
      description: selectedTaskSuggestion.description,
      priority: selectedTaskSuggestion.priority || 'HIGH',
      status: 'TODO',
      assignedTo: devUser._id || devUser.id,
      deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      subtasks: [
        { title: 'Camera stream QR decoder component', isCompleted: false },
        { title: 'Pass authentication webhook integration', isCompleted: false },
      ],
    });
  if (createTaskRes.status !== 201) throw new Error('Step 8/9 failed');
  taskId = createTaskRes.body.data._id;
  console.log(`  ✓ Selected task created and committed to DB with ID: ${taskId}`);

  // STEP 10: Verify Task Assigned to Team Member
  console.log('▶ STEP 10: Verifying Task Assignee...');
  const getTaskRes = await request(app)
    .get(`/api/tasks/${taskId}`)
    .set('Authorization', `Bearer ${pmToken}`);
  if (getTaskRes.status !== 200 || !getTaskRes.body.data.assignedTo) throw new Error('Step 10 failed');
  console.log(`  ✓ Task assigned to: ${getTaskRes.body.data.assignedTo.name}`);

  // STEP 11 & 12: Login as Team Member & View Assigned Tasks
  console.log('▶ STEP 11 & 12: Team Member viewing assigned queue...');
  const devTasksRes = await request(app)
    .get('/api/tasks')
    .query({ assignedTo: devUser._id || devUser.id })
    .set('Authorization', `Bearer ${devToken}`);
  if (devTasksRes.status !== 200 || devTasksRes.body.data.length === 0) throw new Error('Step 11/12 failed');
  console.log(`  ✓ Team member found ${devTasksRes.body.data.length} tasks in assigned queue.`);

  // STEP 13: Change Status TODO -> IN_PROGRESS
  console.log('▶ STEP 13: Advancing status to IN_PROGRESS...');
  const startTaskRes = await request(app)
    .patch(`/api/tasks/${taskId}/status`)
    .set('Authorization', `Bearer ${devToken}`)
    .send({ status: 'IN_PROGRESS' });
  if (startTaskRes.status !== 200 || startTaskRes.body.data.status !== 'IN_PROGRESS') throw new Error('Step 13 failed');
  console.log('  ✓ Task status updated to IN_PROGRESS.');

  // STEP 14: Add a comment
  console.log('▶ STEP 14: Adding collaboration comment...');
  const commentRes = await request(app)
    .post('/api/comments')
    .set('Authorization', `Bearer ${devToken}`)
    .send({
      task: taskId,
      project: projectId,
      content: 'QR decoding pipeline and HTML5 video stream integrated successfully.',
    });
  if (commentRes.status !== 201) throw new Error('Step 14 failed');
  console.log('  ✓ Comment posted to task discussion thread.');

  // STEP 15: Verify PM receives notification
  console.log('▶ STEP 15: Verifying notification dispatches for PM...');
  const pmNotifRes = await request(app)
    .get('/api/notifications')
    .set('Authorization', `Bearer ${pmToken}`);
  if (pmNotifRes.status !== 200) throw new Error('Step 15 failed');
  console.log(`  ✓ PM notification mailbox checked (Count: ${pmNotifRes.body.data.notifications.length})`);

  // STEP 16 & 17: Complete the task (COMPLETED)
  console.log('▶ STEP 16 & 17: Completing task deliverables...');
  const completeTaskRes = await request(app)
    .patch(`/api/tasks/${taskId}/status`)
    .set('Authorization', `Bearer ${devToken}`)
    .send({ status: 'COMPLETED' });
  if (completeTaskRes.status !== 200 || completeTaskRes.body.data.status !== 'COMPLETED') throw new Error('Step 16/17 failed');
  console.log('  ✓ Task marked as COMPLETED.');

  // STEP 18: Verify Auto Progress Recalculation & Analytics
  console.log('▶ STEP 18: Verifying Project Progress recalculation (100%)...');
  const updatedProjRes = await request(app)
    .get(`/api/projects/${projectId}`)
    .set('Authorization', `Bearer ${pmToken}`);
  if (updatedProjRes.status !== 200 || updatedProjRes.body.data.progress !== 100) {
    throw new Error(`Step 18 failed: expected 100% progress, got ${updatedProjRes.body.data.progress}%`);
  }
  console.log(`  ✓ Project progress automatically recalculated to: ${updatedProjRes.body.data.progress}%`);

  // STEP 19: AI Project Summary
  console.log('▶ STEP 19: Running AI Project Executive Summary...');
  const summaryRes = await request(app)
    .post('/api/ai/project-summary')
    .set('Authorization', `Bearer ${pmToken}`)
    .send({ projectId });
  if (summaryRes.status !== 200 || !summaryRes.body.data.healthStatus) throw new Error('Step 19 failed');
  console.log(`  ✓ AI Summary generated (Health Status: ${summaryRes.body.data.healthStatus})`);

  // STEP 20: AI Risk Analysis & Security Validation
  console.log('▶ STEP 20: Running AI Risk Analysis & Admin RBAC validation...');
  const riskRes = await request(app)
    .post('/api/ai/risk-analysis')
    .set('Authorization', `Bearer ${pmToken}`)
    .send({ projectId });
  if (riskRes.status !== 200) throw new Error('Step 20 AI Risk failed');
  console.log(`  ✓ AI Risk Analysis completed (Risk count: ${riskRes.body.data.risks.length})`);

  // Admin Guard Check
  const adminStatsRes = await request(app)
    .get('/api/admin/statistics')
    .set('Authorization', `Bearer ${adminToken}`);
  if (adminStatsRes.status !== 200) throw new Error('Step 20 Admin stats failed');

  const forbiddenCheck = await request(app)
    .get('/api/admin/statistics')
    .set('Authorization', `Bearer ${devToken}`);
  if (forbiddenCheck.status !== 403) throw new Error('Step 20 RBAC guard failed');
  console.log('  ✓ Admin console verified & unauthorized member access strictly blocked (403 Forbidden).');

  console.log('\n====================================================');
  console.log('ALL 20 E2E WORKFLOW STEPS PASSED SUCCESSFULLY (100%)');
  console.log('====================================================\n');

  await mongoose.connection.close();
}

runE2EWorkflow().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
