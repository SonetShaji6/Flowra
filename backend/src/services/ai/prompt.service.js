const buildTaskGenerationPrompts = ({ projectName, goal, description, existingTasks = [] }) => {
  const systemPrompt = `You are Flowra's AI Project Assistant, an expert technical agile coach and engineering project manager.
Your role is to analyze project goals and output high-quality, actionable, logically sequenced tasks.
Return ONLY valid JSON matching this schema:
{
  "tasks": [
    {
      "title": "Clear action-oriented title",
      "description": "Short explanation of work required and acceptance criteria",
      "priority": "HIGH" | "MEDIUM" | "LOW" | "CRITICAL",
      "estimatedDays": number
    }
  ]
}`;

  const userPrompt = `Project Name: ${projectName || 'Untitled Project'}
Goal / Requirement: ${goal || description || 'Develop key features for this project.'}
Existing Tasks in Project: ${existingTasks.map(t => t.title).slice(0, 10).join(', ') || 'None yet'}

Generate 4 to 6 structured, high-value tasks necessary to achieve this goal.`;

  return { systemPrompt, userPrompt };
};

const buildTaskBreakdownPrompts = ({ taskTitle, description, projectContext = '' }) => {
  const systemPrompt = `You are Flowra's AI Task Decomposition Assistant.
Break down the given task into logical, sequential subtasks.
Return ONLY valid JSON matching this schema:
{
  "subtasks": [
    {
      "title": "Specific step to complete",
      "isCompleted": false
    }
  ]
}`;

  const userPrompt = `Task Title: ${taskTitle}
Description: ${description || 'No description'}
Project Context: ${projectContext || 'General software development project'}

Break this task down into 3 to 5 clear, concrete subtasks.`;

  return { systemPrompt, userPrompt };
};

const buildProjectSummaryPrompts = ({ project, tasks = [], activities = [] }) => {
  const systemPrompt = `You are Flowra's AI Executive Project Summarizer.
Analyze the project status, task completion rate, and recent activities to generate a concise summary.
Return ONLY valid JSON matching this schema:
{
  "healthStatus": "ON_TRACK" | "AT_RISK" | "NEEDS_ATTENTION",
  "summary": "2-3 sentences summarizing progress, momentum, and outlook",
  "keyHighlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
  "recommendedNextSteps": ["Step 1", "Step 2"]
}`;

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'COMPLETED').length;

  const userPrompt = `Project: ${project.name} (${project.status}, Priority: ${project.priority})
Progress: ${project.progress || 0}%
Total Tasks: ${total} (Completed: ${completed}, In Progress: ${inProgress}, Overdue: ${overdue})
Recent Activities: ${activities.map(a => `${a.action} on ${a.entityType}`).slice(0, 5).join(', ') || 'None'}

Provide an executive summary and health assessment.`;

  return { systemPrompt, userPrompt };
};

const buildRiskAnalysisPrompts = ({ project, tasks = [], members = [] }) => {
  const systemPrompt = `You are Flowra's AI Risk & Bottleneck Detection Engine.
Analyze project workload, approaching deadlines, and stalled tasks to identify delivery risks.
Return ONLY valid JSON matching this schema:
{
  "risks": [
    {
      "severity": "HIGH" | "MEDIUM" | "LOW" | "CRITICAL",
      "title": "Short title describing the risk",
      "description": "Why this is a risk",
      "recommendation": "Concrete mitigation action for the project manager"
    }
  ]
}`;

  const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'COMPLETED');
  const highPriorityIncomplete = tasks.filter(t => (t.priority === 'HIGH' || t.priority === 'CRITICAL') && t.status !== 'COMPLETED');
  const unassigned = tasks.filter(t => !t.assignedTo && t.status !== 'COMPLETED');

  const userPrompt = `Project: ${project.name}
Total Tasks: ${tasks.length}
Overdue Tasks: ${overdue.map(t => t.title).join(', ') || 'None'}
High Priority Incomplete: ${highPriorityIncomplete.map(t => t.title).join(', ') || 'None'}
Unassigned Tasks: ${unassigned.length}
Total Team Members: ${members.length}

Identify all potential delivery risks and suggest concrete mitigations.`;

  return { systemPrompt, userPrompt };
};

module.exports = {
  buildTaskGenerationPrompts,
  buildTaskBreakdownPrompts,
  buildProjectSummaryPrompts,
  buildRiskAnalysisPrompts,
};
