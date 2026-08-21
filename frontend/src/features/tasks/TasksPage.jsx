import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Calendar,
  User as UserIcon,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import { taskService } from '../../services/task.service';
import { projectService } from '../../services/project.service';
import { useAuth } from '../../context/AuthContext';
import {
  Card,
  Button,
  Badge,
  Avatar,
  LoadingSpinner,
  EmptyState,
} from '../../components/ui';
import { TaskModal } from './TaskModal';
import { TaskDetailsDrawer } from './TaskDetailsDrawer';

const STATUS_COLUMNS = [
  { id: 'TODO', label: 'To Do', color: 'border-slate-300 bg-slate-50/50' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-blue-300 bg-blue-50/30' },
  { id: 'REVIEW', label: 'Review', color: 'border-amber-300 bg-amber-50/30' },
  { id: 'COMPLETED', label: 'Completed', color: 'border-emerald-300 bg-emerald-50/30' },
];

export const TasksPage = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Views
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('BOARD'); // BOARD | LIST

  // Modals & Details
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData] = await Promise.all([
        taskService.getTasks(),
        projectService.getProjects().catch(() => []),
      ]);
      setTasks(tasksData || []);
      setProjects(projectsData || []);
    } catch (err) {
      console.error('Failed to load tasks data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: next } : t))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
    const matchesProject =
      projectFilter === 'ALL' ||
      (task.project?._id || task.project)?.toString() === projectFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tasks</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Unified workspace task board with Kanban and list views.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
            <button
              onClick={() => setViewMode('BOARD')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'BOARD'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'LIST'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            icon={Plus}
            onClick={() => {
              setEditingTask(null);
              setTaskModalOpen(true);
            }}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading tasks..." />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks match your filters"
          description="Try modifying search keywords or create a new task."
          action={
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
          }
        />
      ) : viewMode === 'BOARD' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {STATUS_COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/80 flex flex-col min-h-[450px]"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {col.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-600 border border-slate-200">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  {colTasks.map((t) => (
                    <Card
                      key={t._id}
                      hover
                      onClick={() => setSelectedTask(t)}
                      className="p-4 space-y-3 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <Badge
                          size="xs"
                          variant={
                            t.priority === 'CRITICAL'
                              ? 'danger'
                              : t.priority === 'HIGH'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {t.priority}
                        </Badge>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusAdvance(t._id, t.status);
                          }}
                          className="text-slate-400 hover:text-teal-600 p-1"
                          title="Advance status"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                          {t.title}
                        </h4>
                        <span className="text-[10px] text-[#0F766E] font-medium block mt-1">
                          {t.project?.name || 'Project'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Avatar name={t.assignedTo?.name || 'U'} size="sm" />
                          <span className="truncate max-w-[80px] text-[10px]">
                            {t.assignedTo?.name?.split(' ')[0] || 'Unassigned'}
                          </span>
                        </div>
                        {t.deadline && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(t.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="divide-y divide-slate-100 overflow-hidden">
          {filteredTasks.map((t) => (
            <div
              key={t._id}
              onClick={() => setSelectedTask(t)}
              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors cursor-pointer"
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
                  <h4
                    className={`text-xs font-semibold truncate ${
                      t.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {t.title}
                  </h4>
                  <span className="text-[10px] text-[#0F766E] font-medium">
                    {t.project?.name || 'Project'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Avatar name={t.assignedTo?.name || 'U'} size="sm" />
                  <span className="hidden sm:inline text-xs">{t.assignedTo?.name || 'Unassigned'}</span>
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
            </div>
          ))}
        </Card>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        projectId={projects[0]?._id}
        projectMembers={projects[0]?.members || []}
        taskToEdit={editingTask}
        onTaskSaved={() => loadData()}
      />

      {/* Task Details Drawer */}
      <TaskDetailsDrawer
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={() => loadData()}
      />
    </div>
  );
};
