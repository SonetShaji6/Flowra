import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/project.service';
import {
  Card,
  Button,
  Badge,
  ProgressBar,
  LoadingSpinner,
  EmptyState,
} from '../../components/ui';
import { CreateProjectModal } from './CreateProjectModal';

export const ProjectsPage = () => {
  const { isProjectManager } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, collaborate, and track delivery progress across all project streams.
          </p>
        </div>

        {isProjectManager && (
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            New Project
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'ACTIVE', 'PLANNING', 'COMPLETED', 'ON_HOLD'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Loading projects..." />
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <Card
              key={project._id}
              hover
              onClick={() => navigate(`/projects/${project._id}`)}
              className="p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge
                    variant={
                      project.priority === 'CRITICAL'
                        ? 'danger'
                        : project.priority === 'HIGH'
                        ? 'warning'
                        : project.priority === 'LOW'
                        ? 'default'
                        : 'teal'
                    }
                  >
                    {project.priority} Priority
                  </Badge>

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

                <h3 className="text-base font-bold text-slate-900 line-clamp-1 hover:text-[#0F766E] transition-colors mt-1">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                <ProgressBar progress={project.progress || 0} size="sm" />

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{project.members?.length || 1} members</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {project.deadline
                        ? new Date(project.deadline).toLocaleDateString()
                        : 'No deadline'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={
            search || statusFilter !== 'ALL'
              ? 'No projects matched your search criteria.'
              : 'Create your first project to get started.'
          }
          action={
            isProjectManager ? (
              <Button size="sm" icon={Plus} onClick={() => setModalOpen(true)}>
                Create Project
              </Button>
            ) : null
          }
        />
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onProjectCreated={(newProj) => {
          setProjects([newProj, ...projects]);
        }}
      />
    </div>
  );
};
