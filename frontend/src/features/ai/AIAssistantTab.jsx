import React, { useState } from 'react';
import {
  Sparkles,
  CheckSquare,
  AlertTriangle,
  FileText,
  Plus,
  ArrowRight,
  Check,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { aiService } from '../../services/extra.service';
import { taskService } from '../../services/task.service';
import { Button, Card, Badge, LoadingSpinner } from '../../components/ui';

export const AIAssistantTab = ({ project, onTasksCreated }) => {
  const [activeTool, setActiveTool] = useState('GENERATE'); // GENERATE | SUMMARY | RISKS
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // AI Task Generation State
  const [suggestedTasks, setSuggestedTasks] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [creatingTasks, setCreatingTasks] = useState(false);

  // Summary State
  const [summaryData, setSummaryData] = useState(null);

  // Risk State
  const [riskData, setRiskData] = useState(null);

  const getValidProjectId = () => {
    return project?._id || project?.id || (typeof project === 'string' ? project : null);
  };

  const handleGenerateTasks = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const projId = getValidProjectId();
      const res = await aiService.generateTasks({
        projectId: projId || undefined,
        projectName: project?.name,
        description: project?.description,
        goal: goal || project?.description || 'Build core features for this project.',
      });

      const tasks = res?.tasks || res?.data?.tasks || (Array.isArray(res) ? res : []);
      setSuggestedTasks(tasks);
      setSelectedIndices(new Set(tasks.map((_, i) => i)));
    } catch (err) {
      setError(err.message || 'AI task generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectTask = (index) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedIndices(next);
  };

  const handleCreateSelectedTasks = async () => {
    if (selectedIndices.size === 0) return;
    setCreatingTasks(true);
    setError('');

    try {
      const projId = getValidProjectId();
      if (!projId) {
        throw new Error('Please select an active project before creating tasks.');
      }

      const tasksToCreate = suggestedTasks.filter((_, i) => selectedIndices.has(i));
      for (const t of tasksToCreate) {
        await taskService.createTask({
          project: projId,
          title: t.title,
          description: t.description || `Task for ${project?.name || 'project'}`,
          priority: t.priority || 'MEDIUM',
          status: 'TODO',
        });
      }

      setSuccessMessage(`Successfully created ${tasksToCreate.length} tasks in "${project?.name || 'Project'}"!`);
      setSuggestedTasks([]);
      setSelectedIndices(new Set());
      if (onTasksCreated) onTasksCreated();
    } catch (err) {
      setError(err.message || 'Failed to create selected tasks.');
    } finally {
      setCreatingTasks(false);
    }
  };

  const handleFetchSummary = async () => {
    const projId = getValidProjectId();
    if (!projId) {
      setError('Please select a project to generate an executive summary.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await aiService.getProjectSummary(projId);
      setSummaryData(data?.data || data);
    } catch (err) {
      setError(err.message || 'Failed to generate project summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchRisks = async () => {
    const projId = getValidProjectId();
    if (!projId) {
      setError('Please select a project to run risk analysis.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await aiService.getRiskAnalysis(projId);
      setRiskData(data?.data || data);
    } catch (err) {
      setError(err.message || 'Failed to perform risk analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tool Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => {
            setActiveTool('GENERATE');
            setError('');
          }}
          className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
            activeTool === 'GENERATE'
              ? 'border-[#0F766E] bg-[#F0FDFA] shadow-xs'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="p-2 rounded-lg bg-[#CCFBF1] text-[#0F766E] shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Task Generator</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Turn objectives into actionable task backlogs.
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTool('RISKS');
            setError('');
            if (!riskData) handleFetchRisks();
          }}
          className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
            activeTool === 'RISKS'
              ? 'border-[#0F766E] bg-[#F0FDFA] shadow-xs'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Risk & Bottlenecks</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Detect blockers, overdue items & capacity.
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTool('SUMMARY');
            setError('');
            if (!summaryData) handleFetchSummary();
          }}
          className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
            activeTool === 'SUMMARY'
              ? 'border-[#0F766E] bg-[#F0FDFA] shadow-xs'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Project Summary</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Executive health assessment & next steps.
            </p>
          </div>
        </button>
      </div>

      {/* Notifications / Alerts */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          {successMessage}
        </div>
      )}

      {/* Tool 1: AI Task Generator */}
      {activeTool === 'GENERATE' && (
        <Card className="p-6">
          <div className="flex items-center gap-2 text-[#0F766E] mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Task Generation</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Generate Task Suggestions for "{project?.name || 'Active Project'}"
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Enter a project milestone or requirement to generate structured tasks ready for approval.
          </p>

          <form onSubmit={handleGenerateTasks} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Build an automated college event management system with ticket booking..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="flex-1 px-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white transition-all"
              />
              <Button type="submit" loading={loading} icon={Sparkles}>
                Generate Suggestions
              </Button>
            </div>
          </form>

          {/* Structured Suggestions Checklist */}
          {suggestedTasks.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Review Suggested Tasks ({selectedIndices.size}/{suggestedTasks.length} Selected)
                </span>
                <button
                  onClick={() => {
                    if (selectedIndices.size === suggestedTasks.length) {
                      setSelectedIndices(new Set());
                    } else {
                      setSelectedIndices(new Set(suggestedTasks.map((_, i) => i)));
                    }
                  }}
                  className="text-xs font-semibold text-[#0F766E] hover:underline"
                >
                  {selectedIndices.size === suggestedTasks.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-2.5">
                {suggestedTasks.map((t, idx) => {
                  const isChecked = selectedIndices.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSelectTask(idx)}
                      className={`p-3.5 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#0F766E] bg-[#F0FDFA]'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectTask(idx)}
                        className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-900">{t.title}</span>
                          <Badge size="xs" variant={t.priority === 'HIGH' || t.priority === 'CRITICAL' ? 'warning' : 'default'}>
                            {t.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleCreateSelectedTasks}
                  loading={creatingTasks}
                  disabled={selectedIndices.size === 0}
                  icon={Plus}
                >
                  Create Selected Tasks ({selectedIndices.size})
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Tool 2: Risk & Bottlenecks Analysis */}
      {activeTool === 'RISKS' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-amber-700 mb-1">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Risk Analysis</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Project Risk Detection</h3>
            </div>
            <Button size="sm" variant="outline" onClick={handleFetchRisks} loading={loading}>
              Re-scan Project
            </Button>
          </div>

          {loading ? (
            <LoadingSpinner text="Scanning tasks, deadlines, and workload for risks..." />
          ) : riskData?.risks?.length > 0 ? (
            <div className="space-y-3">
              {riskData.risks.map((risk, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                    risk.severity === 'HIGH' || risk.severity === 'CRITICAL'
                      ? 'border-rose-200 bg-rose-50/50'
                      : risk.severity === 'MEDIUM'
                      ? 'border-amber-200 bg-amber-50/50'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{risk.title}</span>
                    <Badge
                      size="xs"
                      variant={
                        risk.severity === 'HIGH' || risk.severity === 'CRITICAL'
                          ? 'danger'
                          : risk.severity === 'MEDIUM'
                          ? 'warning'
                          : 'teal'
                      }
                    >
                      {risk.severity} Severity
                    </Badge>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{risk.description}</p>
                  <div className="pt-2 border-t border-slate-200/60 font-medium text-slate-800 flex items-start gap-1.5">
                    <strong className="text-[#0F766E]">Recommendation:</strong>
                    <span>{risk.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">
              No critical risks detected in this project.
            </p>
          )}
        </Card>
      )}

      {/* Tool 3: Executive Summary */}
      {activeTool === 'SUMMARY' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Executive Summary</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Project Health & Status</h3>
            </div>
            <Button size="sm" variant="outline" onClick={handleFetchSummary} loading={loading}>
              Refresh Summary
            </Button>
          </div>

          {loading ? (
            <LoadingSpinner text="Generating executive project summary..." />
          ) : summaryData ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800">Health Assessment</span>
                  <Badge
                    variant={
                      summaryData.healthStatus === 'ON_TRACK'
                        ? 'success'
                        : summaryData.healthStatus === 'AT_RISK'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {summaryData.healthStatus?.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-slate-700 leading-relaxed text-sm font-medium">
                  {summaryData.summary}
                </p>
              </div>

              {summaryData.keyHighlights?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Key Highlights
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {summaryData.keyHighlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] mt-1.5 shrink-0" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summaryData.recommendedNextSteps?.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Recommended Next Steps
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {summaryData.recommendedNextSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-[#0F766E] mt-0.5 shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">
              Click refresh to generate an AI summary for this project.
            </p>
          )}
        </Card>
      )}
    </div>
  );
};
