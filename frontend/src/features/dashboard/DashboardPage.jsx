import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity as ActivityIcon,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/project.service';
import { taskService } from '../../services/task.service';
import { analyticsService } from '../../services/extra.service';
import { activityService } from '../../services/collaboration.service';
import {
  Card,
  KPICard,
  Button,
  Badge,
  ProgressBar,
  LoadingSpinner,
  EmptyState,
} from '../../components/ui';

export const DashboardPage = () => {
  const { user, isProjectManager } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [activities, setActivities] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, projectsData, tasksData, activitiesData] = await Promise.all([
        analyticsService.getOverview().catch(() => null),
        projectService.getProjects().catch(() => []),
        taskService.getTasks({ assignedTo: user?.id || user?._id }).catch(() => []),
        activityService.getActivities().catch(() => []),
      ]);

      setStats(analyticsData?.overview || {
        totalProjects: projectsData.length,
        activeProjects: projectsData.filter((p) => p.status === 'ACTIVE').length,
        totalTasks: tasksData.length,
        overdueTasks: 0,
      });
      setProjects(projectsData || []);
      setMyTasks(tasksData || []);
      setActivities(activitiesData || []);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleStatusToggle = async (taskId, currentStatus) => {
    const nextStatusMap = {
      TODO: 'IN_PROGRESS',
      IN_PROGRESS: 'COMPLETED',
      REVIEW: 'COMPLETED',
      COMPLETED: 'TODO',
    };
    const nextStatus = nextStatusMap[currentStatus] || 'TODO';

    try {
      await taskService.updateTaskStatus(taskId, nextStatus);
      setMyTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: nextStatus } : t))
      );
      // Reload projects to reflect new progress %
      const updatedProjects = await projectService.getProjects();
      setProjects(updatedProjects);
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading workspace insights..." />;
  }

  const activeProjects = projects.filter((p) => p.status !== 'ARCHIVED');

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">
              Workspace Overview
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Team'}
          </h1>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            You have {myTasks.filter((t) => t.status !== 'COMPLETED').length} pending tasks assigned. Projects are currently running on schedule.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Button variant="secondary" icon={Sparkles} onClick={() => navigate('/ai')}>
            AI Assistant
          </Button>
          {isProjectManager && (
            <Button icon={Plus} onClick={() => navigate('/projects')}>
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Projects"
          value={stats?.totalProjects ?? projects.length}
          subtitle="Managed in workspace"
          icon={FolderKanban}
        />
        <KPICard
          title="Active Projects"
          value={stats?.activeProjects ?? activeProjects.length}
          subtitle="In flight & planning"
          icon={TrendingUp}
        />
        <KPICard
          title="My Open Tasks"
          value={myTasks.filter((t) => t.status !== 'COMPLETED').length}
          subtitle="Assigned to your queue"
          icon={Clock}
        />
        <KPICard
          title="Overdue Tasks"
          value={stats?.overdueTasks ?? 0}
          subtitle="Requiring attention"
          icon={AlertTriangle}
        />
      </div>

      {/* Main Grid: Projects & My Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Projects */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Active Projects
                </h2>
                <p className="text-xs text-slate-500">Live progress across current initiatives</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => navigate('/projects')}>
                View All &rarr;
              </Button>
            </div>

            {activeProjects.length > 0 ? (
              <div className="space-y-4">
                {activeProjects.slice(0, 4).map((project) => (
                  <div
                    key={project._id}
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className="p-4 rounded-xl border border-slate-100 hover:border-teal-600/30 hover:bg-slate-50/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 hover:text-[#0F766E] transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {project.description}
                        </p>
                      </div>
                      <Badge
                        variant={
                          project.status === 'COMPLETED'
                            ? 'success'
                            : project.status === 'ACTIVE'
                            ? 'teal'
                            : 'default'
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>

                    <div className="mt-3">
                      <ProgressBar progress={project.progress || 0} size="sm" />
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Manager: <strong className="text-slate-700">{project.manager?.name || 'Unassigned'}</strong></span>
                      <span>Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FolderKanban}
                title="No active projects"
                description="Create your first project to start tracking tasks and team progress."
                action={
                  <Button size="sm" icon={Plus} onClick={() => navigate('/projects')}>
                    Create Project
                  </Button>
                }
              />
            )}
          </Card>

          {/* My Tasks Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  My Assigned Tasks
                </h2>
                <p className="text-xs text-slate-500">Click circle to advance status</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => navigate('/tasks')}>
                All Tasks &rarr;
              </Button>
            </div>

            {myTasks.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {myTasks.slice(0, 5).map((task) => (
                  <div
                    key={task._id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleStatusToggle(task._id, task.status)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          task.status === 'COMPLETED'
                            ? 'bg-[#0F766E] border-[#0F766E] text-white'
                            : 'border-slate-300 hover:border-[#0F766E] text-transparent hover:text-slate-400'
                        }`}
                        title="Toggle status"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-semibold truncate ${
                            task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {task.project?.name || 'Project'} &bull; Priority: {task.priority}
                        </span>
                      </div>
                    </div>

                    <Badge
                      size="xs"
                      variant={
                        task.status === 'COMPLETED'
                          ? 'success'
                          : task.status === 'IN_PROGRESS'
                          ? 'info'
                          : 'default'
                      }
                    >
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No tasks currently assigned to you.</p>
            )}
          </Card>
        </div>

        {/* Right 1 Col: AI Insights & Activity Feed */}
        <div className="space-y-6">
          {/* AI Project Assistant Card */}
          <Card className="p-6 bg-gradient-to-br from-[#F0FDFA] to-white border-[#CCFBF1]">
            <div className="flex items-center gap-2 text-[#0F766E] mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Assistant</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Accelerate Project Workflows</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Use Flowra AI to generate full task backlogs, analyze delivery risks, and generate executive project summaries.
            </p>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="primary"
                className="w-full justify-between"
                onClick={() => navigate('/ai')}
              >
                <span>Generate Tasks with AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate('/ai')}
              >
                <span>Scan Project Risks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ActivityIcon className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Recent Activities
              </h2>
            </div>

            {activities.length > 0 ? (
              <div className="space-y-3.5">
                {activities.slice(0, 6).map((act) => (
                  <div key={act._id} className="text-xs flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#14B8A6] mt-1.5 shrink-0" />
                    <div>
                      <p className="text-slate-800 leading-snug">
                        <strong className="text-slate-900">{act.user?.name || 'User'}</strong>{' '}
                        {act.action?.replace('_', ' ').toLowerCase()} on{' '}
                        <span className="text-[#0F766E] font-medium">{act.project?.name || 'Project'}</span>
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No recent activities recorded.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
