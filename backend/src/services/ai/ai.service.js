const AIInteraction = require('../../models/AIInteraction');
const providerService = require('./provider.service');
const {
  buildTaskGenerationPrompts,
  buildTaskBreakdownPrompts,
  buildProjectSummaryPrompts,
  buildRiskAnalysisPrompts,
} = require('./prompt.service');

class AIService {
  async logInteraction({ userId, projectId, type, prompt, response, tokensUsed = 0 }) {
    try {
      if (userId && type) {
        await AIInteraction.create({
          user: userId,
          project: projectId || null,
          type,
          prompt: typeof prompt === 'string' ? prompt : JSON.stringify(prompt),
          response,
          tokensUsed,
        });
      }
    } catch (err) {
      console.warn('Could not log AI interaction:', err.message);
    }
  }

  async generateTasks({ projectName, description, goal, existingTasks = [], userId, projectId }) {
    const { systemPrompt, userPrompt } = buildTaskGenerationPrompts({
      projectName,
      goal: goal || description,
      description,
      existingTasks,
    });

    const llmResult = await providerService.callLLM(systemPrompt, userPrompt);
    let outputTasks = [];
    let tokensUsed = llmResult?.tokensUsed || 0;

    if (llmResult?.content?.tasks && Array.isArray(llmResult.content.tasks)) {
      outputTasks = llmResult.content.tasks.map(t => ({
        title: t.title,
        description: t.description || `Generated task for ${projectName || 'project'}`,
        priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(t.priority) ? t.priority : 'MEDIUM',
        status: 'TODO',
      }));
    } else {
      // Intelligent Contextual Heuristic Engine
      const cleanGoal = (goal || description || projectName || 'Feature Implementation').trim();
      const baseTitle = projectName || 'Project';
      
      outputTasks = [
        {
          title: `Architecture & Requirements for ${cleanGoal.slice(0, 40)}`,
          description: `Analyze scope, outline architecture, and document user stories for: ${cleanGoal}`,
          priority: 'HIGH',
          status: 'TODO',
        },
        {
          title: `Database Schema & API Design for ${cleanGoal.slice(0, 40)}`,
          description: `Define data models, relationships, validation rules, and RESTful route contracts.`,
          priority: 'HIGH',
          status: 'TODO',
        },
        {
          title: `Frontend Interface & Responsive Views`,
          description: `Build modern UI components matching design tokens with error states and form validation.`,
          priority: 'MEDIUM',
          status: 'TODO',
        },
        {
          title: `Integration, Testing & Verification`,
          description: `Perform end-to-end testing, verify API integration, edge cases, and QA acceptance.`,
          priority: 'MEDIUM',
          status: 'TODO',
        },
        {
          title: `Production Deployment & Security Audit`,
          description: `Review environment variables, verify rate limiting, authorization, and prepare launch release.`,
          priority: 'LOW',
          status: 'TODO',
        },
      ];
    }

    await this.logInteraction({
      userId,
      projectId,
      type: 'TASK_GENERATION',
      prompt: { projectName, goal: goal || description },
      response: { tasks: outputTasks },
      tokensUsed,
    });

    return {
      projectName: projectName || 'Project',
      tasks: outputTasks,
      provider: llmResult ? llmResult.provider : 'flowra-heuristic-engine',
    };
  }

  async breakdownTask({ taskTitle, description, projectContext = '', userId, projectId, taskId }) {
    const { systemPrompt, userPrompt } = buildTaskBreakdownPrompts({
      taskTitle,
      description,
      projectContext,
    });

    const llmResult = await providerService.callLLM(systemPrompt, userPrompt);
    let subtasks = [];
    let tokensUsed = llmResult?.tokensUsed || 0;

    if (llmResult?.content?.subtasks && Array.isArray(llmResult.content.subtasks)) {
      subtasks = llmResult.content.subtasks.map(st => ({
        title: typeof st === 'string' ? st : st.title,
        isCompleted: false,
      }));
    } else {
      const cleanTitle = taskTitle || 'Task';
      subtasks = [
        { title: `Define specifications and acceptance criteria for ${cleanTitle}`, isCompleted: false },
        { title: `Implement core logic and data structure`, isCompleted: false },
        { title: `Build UI components and connect API handlers`, isCompleted: false },
        { title: `Write tests and verify edge cases`, isCompleted: false },
      ];
    }

    await this.logInteraction({
      userId,
      projectId,
      type: 'TASK_BREAKDOWN',
      prompt: { taskTitle, description },
      response: { subtasks },
      tokensUsed,
    });

    return {
      task: taskTitle,
      subtasks,
      provider: llmResult ? llmResult.provider : 'flowra-heuristic-engine',
    };
  }

  async generateProjectSummary({ project, tasks = [], activities = [], userId }) {
    const { systemPrompt, userPrompt } = buildProjectSummaryPrompts({
      project,
      tasks,
      activities,
    });

    const llmResult = await providerService.callLLM(systemPrompt, userPrompt);
    let result = {};
    let tokensUsed = llmResult?.tokensUsed || 0;

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'COMPLETED').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : project.progress || 0;

    if (llmResult?.content?.summary) {
      result = {
        healthStatus: llmResult.content.healthStatus || (overdue > 0 ? 'AT_RISK' : 'ON_TRACK'),
        summary: llmResult.content.summary,
        keyHighlights: llmResult.content.keyHighlights || [],
        recommendedNextSteps: llmResult.content.recommendedNextSteps || [],
        progress,
        taskStats: { total, completed, inProgress, overdue },
      };
    } else {
      let healthStatus = 'ON_TRACK';
      if (overdue > 1) healthStatus = 'AT_RISK';
      else if (overdue === 1 || inProgress > 5) healthStatus = 'NEEDS_ATTENTION';

      result = {
        healthStatus,
        summary: `Project "${project.name}" is currently at ${progress}% completion with ${completed} of ${total} tasks completed. ${inProgress} tasks are actively in progress.`,
        keyHighlights: [
          `${completed} tasks successfully delivered (${progress}% overall progress)`,
          `${inProgress} tasks actively in progress across team members`,
          overdue > 0 ? `${overdue} tasks currently requiring deadline attention` : 'All tasks within scheduled timelines',
        ],
        recommendedNextSteps: [
          inProgress > 0 ? 'Focus team capacity on transitioning IN_PROGRESS tasks to REVIEW' : 'Assign upcoming backlog tasks to team members',
          'Review upcoming milestones and align deliverables',
        ],
        progress,
        taskStats: { total, completed, inProgress, overdue },
      };
    }

    await this.logInteraction({
      userId,
      projectId: project._id,
      type: 'HEALTH_SUMMARY',
      prompt: { projectName: project.name, progress },
      response: result,
      tokensUsed,
    });

    return {
      ...result,
      provider: llmResult ? llmResult.provider : 'flowra-heuristic-engine',
    };
  }

  async analyzeRisks({ project, tasks = [], members = [], userId }) {
    const { systemPrompt, userPrompt } = buildRiskAnalysisPrompts({
      project,
      tasks,
      members,
    });

    const llmResult = await providerService.callLLM(systemPrompt, userPrompt);
    let risks = [];
    let tokensUsed = llmResult?.tokensUsed || 0;

    if (llmResult?.content?.risks && Array.isArray(llmResult.content.risks)) {
      risks = llmResult.content.risks;
    } else {
      const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'COMPLETED');
      const highPriorityIncomplete = tasks.filter(t => (t.priority === 'HIGH' || t.priority === 'CRITICAL') && t.status !== 'COMPLETED');
      const unassigned = tasks.filter(t => !t.assignedTo && t.status !== 'COMPLETED');

      if (overdue.length > 0) {
        risks.push({
          severity: 'HIGH',
          title: `${overdue.length} overdue task(s) detected`,
          description: `Tasks past deadline: ${overdue.map(t => t.title).slice(0, 3).join(', ')}`,
          recommendation: 'Reassign or increase developer bandwidth to clear blockers immediately.',
        });
      }

      if (highPriorityIncomplete.length > 2) {
        risks.push({
          severity: 'MEDIUM',
          title: `Concentration of high-priority incomplete tasks`,
          description: `${highPriorityIncomplete.length} high/critical priority items remain incomplete.`,
          recommendation: 'Break high-priority tasks into smaller subtasks and prioritize sprint focus.',
        });
      }

      if (unassigned.length > 0) {
        risks.push({
          severity: 'LOW',
          title: `${unassigned.length} unassigned task(s) in workspace`,
          description: 'Unassigned tasks may stall momentum without a designated owner.',
          recommendation: 'Assign task owners to ensure accountability and track progress.',
        });
      }

      if (risks.length === 0) {
        risks.push({
          severity: 'LOW',
          title: 'Project health is optimal',
          description: 'No major overdue or blocked tasks detected at this time.',
          recommendation: 'Maintain continuous progress monitoring and team velocity.',
        });
      }
    }

    await this.logInteraction({
      userId,
      projectId: project._id,
      type: 'RISK_ANALYSIS',
      prompt: { projectName: project.name, tasksCount: tasks.length },
      response: { risks },
      tokensUsed,
    });

    return {
      projectName: project.name,
      risks,
      analyzedAt: new Date().toISOString(),
      provider: llmResult ? llmResult.provider : 'flowra-heuristic-engine',
    };
  }
}

module.exports = new AIService();
