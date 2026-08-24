import React, { useState, useEffect } from 'react';
import { Sparkles, FolderKanban } from 'lucide-react';
import { projectService } from '../../services/project.service';
import { AIAssistantTab } from './AIAssistantTab';
import { LoadingSpinner, EmptyState, Button } from '../../components/ui';

export const AIAssistantPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProjectId(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load projects for AI:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Initializing AI Assistant engine..." />;
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No projects available"
        description="Create a project to unlock AI task generation, decomposition, and risk scanning."
      />
    );
  }

  const currentProject = projects.find((p) => p._id === selectedProjectId) || projects[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-[#0F766E] mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Project Assistant</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Intelligent Workflow Automation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deconstruct complex goals into actionable tasks, spot blockers, and generate summaries.
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-semibold text-slate-600">Active Project:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
          >
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AI Interactive Panel */}
      {currentProject && (
        <AIAssistantTab
          project={currentProject}
          onTasksCreated={() => {
            // refreshed
          }}
        />
      )}
    </div>
  );
};
