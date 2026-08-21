import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  Users,
  Activity as ActivityIcon,
  BarChart3,
  Sparkles,
  Plus,
  Calendar,
  Clock,
  Trash2,
  Edit,
  Check,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { projectService } from '../../services/project.service';
import { taskService } from '../../services/task.service';
import { activityService } from '../../services/collaboration.service';
import { analyticsService } from '../../services/extra.service';
import { useAuth } from '../../context/AuthContext';
import {
  Card,
  Button,
  Badge,
  ProgressBar,
  Avatar,
  LoadingSpinner,
  EmptyState,
} from '../../components/ui';
import { TaskModal } from '../tasks/TaskModal';
import { TaskDetailsDrawer } from '../tasks/TaskDetailsDrawer';
import { AddMemberModal } from '../team/AddMemberModal';
import { AIAssistantTab } from '../ai/AIAssistantTab';

const STATUS_COLORS = {
  TODO: '#94A3B8',
  IN_PROGRESS: '#3B82F6',
  REVIEW: '#F59E0B',
  COMPLETED: '#10B981',
};

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isProjectManager } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  // Modals & Drawers
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [memberModalOpen, setMemberModalOpen] = useState(false);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projData, tasksData, activitiesData, analyticsData] = await Promise.all([
        projectService.getProjectById(id),
        taskService.getTasks({ project: id }),
        activityService.getProjectActivities(id).catch(() => []),
        analyticsService.getProjectAnalytics(id).catch(() => null),
      ]);

      setProject(projData);
      setTasks(tasksData || []);
      setActivities(activitiesData || []);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id]);

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await projectService.removeMember(id, memberId);
      loadProjectData();
    } catch (err) {
      alert(err.message || 'Failed to remove member.');
    }
  };

  const handleStatusAdvance = async (taskId, currentStatus) => {
    const nextMap = {
      TODO: 'IN_PROGRESS',
      IN_PROGRESS: 'COMPLETED',
      REVIEW: 'COMPLETED',
      COMPLETED: 'TODO',
    };
    const next = nextMap[currentStatus] || 'TODO';
    try {
      await taskService.updateTaskStatus(taskId, next);
      loadProjectData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading project workspace..." />;
  }

  if (!project) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="Project Not Found"
        description="The requested project does not exist or you do not have permission to view it."
        action={<Button onClick={() => navigate('/projects')}>Back to Projects</Button>}
      />
    );
  }

  const tabs = [
    { id: 'OVERVIEW', label: 'Overview', icon: FolderKanban },
    { id: 'TASKS', label: `Tasks (${tasks.length})`, icon: CheckSquare },
    { id: 'TEAM', label: `Team (${project.members?.length || 1})`, icon: Users },
    { id: 'AI', label: 'AI Assistant', icon: Sparkles, badge: 'Smart' },
    { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
    { id: 'ACTIVITY', label: 'Activity', icon: ActivityIcon },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Project Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              onClick={() => navigate('/projects')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Projects
            </span>
            <span className="text-xs text-slate-300">/</span>
            <Badge variant="teal">{project.status}</Badge>
            <Badge variant={project.priority === 'CRITICAL' ? 'danger' : 'warning'}>
              {project.priority} Priority
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{project.name}</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {project.description}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            icon={Sparkles}
            onClick={() => setActiveTab('AI')}
          >
            AI Assistant
          </Button>
          <Button
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingTask(null);
              setTaskModalOpen(true);
            }}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-[#0F766E] text-[#0F766E]'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4 text-current" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#0F766E] text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Overall Progress
              </h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl font-black text-slate-900">{project.progress || 0}%</span>
                <span className="text-xs font-medium text-slate-500">
                  {tasks.filter((t) => t.status === 'COMPLETED').length} of {tasks.length} tasks completed
                </span>
              </div>
              <ProgressBar progress={project.progress || 0} size="lg" showLabel={false} />
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Project Tasks
                </h3>
                <Button size="sm" variant="ghost" onClick={() => setActiveTab('TASKS')}>
                  View All &rarr;
                </Button>
              </div>
              {tasks.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {tasks.slice(0, 5).map((t) => (
                    <div
                      key={t._id}
                      onClick={() => setSelectedTask(t)}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusAdvance(t._id, t.status);
                          }}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            t.status === 'COMPLETED'
                              ? 'bg-[#0F766E] border-[#0F766E] text-white'
                              : 'border-slate-300 hover:border-[#0F766E] text-transparent hover:text-slate-400'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <span
                          className={`text-xs font-semibold truncate ${
                            t.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {t.title}
                        </span>
                      </div>
                      <Badge
                        size="xs"
                        variant={
                          t.status === 'COMPLETED'
                            ? 'success'
                            : t.status === 'IN_PROGRESS'
                            ? 'info'
                            : 'default'
                        }
                      >
                        {t.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">No tasks created yet.</p>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Project Details
              </h3>
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Project Manager</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar name={project.manager?.name} size="sm" />
                    <span className="font-semibold text-slate-900">{project.manager?.name || 'Unassigned'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Timeline</span>
                  <p className="font-medium text-slate-700 mt-0.5">
                    Start: {new Date(project.startDate).toLocaleDateString()}
                  </p>
                  <p className="font-medium text-slate-700">
                    Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'None'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-[#F0FDFA] to-white border-[#CCFBF1]">
              <div className="flex items-center gap-2 text-[#0F766E] mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">AI Assistant</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Generate project tasks or run a risk analysis directly on this project.
              </p>
              <Button size="sm" className="w-full" onClick={() => setActiveTab('AI')}>
                Open AI Panel
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: TASKS */}
      {activeTab === 'TASKS' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Task Backlog</h3>
              <p className="text-xs text-slate-500">Manage deliverables and workflow states</p>
            </div>
            <Button
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingTask(null);
                setTaskModalOpen(true);
              }}
            >
              Create Task
            </Button>
          </div>

          {tasks.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {tasks.map((t) => (
                <div
                  key={t._id}
                  onClick={() => setSelectedTask(t)}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 px-3 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusAdvance(t._id, t.status);
                      }}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        t.status === 'COMPLETED'
                          ? 'bg-[#0F766E] border-[#0F766E] text-white'
                          : 'border-slate-300 hover:border-[#0F766E] text-transparent hover:text-slate-400'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-semibold truncate ${
                          t.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                        <span>Assignee: {t.assignedTo?.name || 'Unassigned'}</span>
                        {t.subtasks?.length > 0 && (
                          <span>
                            &bull; Subtasks: {t.subtasks.filter((s) => s.isCompleted).length}/
                            {t.subtasks.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge size="xs" variant={t.priority === 'HIGH' ? 'warning' : 'default'}>
                      {t.priority}
                    </Badge>
                    <Badge
                      size="xs"
                      variant={
                        t.status === 'COMPLETED'
                          ? 'success'
                          : t.status === 'IN_PROGRESS'
                          ? 'info'
                          : 'default'
                      }
                    >
                      {t.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckSquare}
              title="No tasks in this project"
              description="Create a task or generate tasks automatically using Flowra AI."
              action={
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    icon={Plus}
                    onClick={() => {
                      setEditingTask(null);
                      setTaskModalOpen(true);
                    }}
                  >
                    Create Task
                  </Button>
                  <Button size="sm" variant="secondary" icon={Sparkles} onClick={() => setActiveTab('AI')}>
                    Generate with AI
                  </Button>
                </div>
              }
            />
          )}
        </Card>
      )}

      {/* TAB 3: TEAM */}
      {activeTab === 'TEAM' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Project Members</h3>
              <p className="text-xs text-slate-500">Collaborators assigned to this project</p>
            </div>
            {isProjectManager && (
              <Button size="sm" icon={Plus} onClick={() => setMemberModalOpen(true)}>
                Add Member
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Manager Card */}
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={project.manager?.name} size="md" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{project.manager?.name}</h4>
                  <p className="text-[10px] text-slate-500">{project.manager?.email}</p>
                </div>
              </div>
              <Badge variant="teal" size="xs">Project Lead</Badge>
            </div>

            {/* Other Members */}
            {(project.members || [])
              .filter((m) => (m._id || m).toString() !== (project.manager?._id || project.manager).toString())
              .map((member) => (
                <div
                  key={member._id}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name} size="md" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{member.name}</h4>
                      <p className="text-[10px] text-slate-500">{member.email}</p>
                    </div>
                  </div>
                  {isProjectManager && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* TAB 4: AI ASSISTANT */}
      {activeTab === 'AI' && (
        <AIAssistantTab
          project={project}
          onTasksCreated={() => {
            loadProjectData();
          }}
        />
      )}

      {/* TAB 5: ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
              Task Status Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={
                      analytics?.statusDistribution || [
                        { name: 'TODO', count: tasks.filter((t) => t.status === 'TODO').length },
                        { name: 'IN_PROGRESS', count: tasks.filter((t) => t.status === 'IN_PROGRESS').length },
                        { name: 'REVIEW', count: tasks.filter((t) => t.status === 'REVIEW').length },
                        { name: 'COMPLETED', count: tasks.filter((t) => t.status === 'COMPLETED').length },
                      ]
                    }
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'].map((st) => (
                      <Cell key={st} fill={STATUS_COLORS[st]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
              Priority Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    analytics?.priorityDistribution || [
                      { name: 'LOW', count: tasks.filter((t) => t.priority === 'LOW').length },
                      { name: 'MEDIUM', count: tasks.filter((t) => t.priority === 'MEDIUM').length },
                      { name: 'HIGH', count: tasks.filter((t) => t.priority === 'HIGH').length },
                      { name: 'CRITICAL', count: tasks.filter((t) => t.priority === 'CRITICAL').length },
                    ]
                  }
                >
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0F766E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 6: ACTIVITY */}
      {activeTab === 'ACTIVITY' && (
        <Card className="p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
            Project Event History
          </h3>
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((act) => (
                <div key={act._id} className="text-xs flex items-start gap-3 border-l-2 border-teal-500 pl-4 py-1">
                  <div className="flex-1">
                    <p className="text-slate-800">
                      <strong className="text-slate-900">{act.user?.name || 'User'}</strong>{' '}
                      performed <strong className="text-[#0F766E]">{act.action?.replace('_', ' ')}</strong> on{' '}
                      <span className="font-semibold">{act.entityType}</span>
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No recorded activity on this project.</p>
          )}
        </Card>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        projectId={project._id}
        projectMembers={project.members || []}
        taskToEdit={editingTask}
        onTaskSaved={() => loadProjectData()}
      />

      {/* Task Details Drawer */}
      <TaskDetailsDrawer
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={() => loadProjectData()}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        projectId={project._id}
        currentMembers={project.members || []}
        onMemberAdded={() => loadProjectData()}
      />
    </div>
  );
};
