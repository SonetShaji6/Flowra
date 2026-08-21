import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Bell,
  Sparkles,
  Palette,
  Shield,
  Save,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Input, Badge } from '../../components/ui';

export const SettingsPage = () => {
  const { user } = useAuth();

  // Notification Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // AI Preferences
  const [aiSuggestionsCount, setAiSuggestionsCount] = useState('8');
  const [autoRiskScan, setAutoRiskScan] = useState(true);

  // Feedback State
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Top Banner */}
      <div className="flex items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="p-2.5 rounded-xl bg-[#CCFBF1] text-[#0F766E]">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Workspace Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your workspace configuration, notification dispatches, and AI Assistant preferences.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" /> Preferences saved successfully!
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 text-[#0F766E] mb-4">
            <Bell className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Notification Preferences</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Task Assignment Alerts</span>
                <span className="text-[11px] text-slate-500">
                  Receive notifications when team members assign tasks to your queue.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Deadline & Overdue Reminders</span>
                <span className="text-[11px] text-slate-500">
                  Get notified 24 hours prior to target milestone deadlines.
                </span>
              </div>
              <input
                type="checkbox"
                checked={taskReminders}
                onChange={(e) => setTaskReminders(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Weekly Project Digest</span>
                <span className="text-[11px] text-slate-500">
                  Receive executive summary reports on project health every Monday.
                </span>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
              />
            </label>
          </div>
        </Card>

        {/* AI Assistant Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 text-[#0F766E] mb-4">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">AI Assistant Defaults</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Suggested Tasks Limit
              </label>
              <select
                value={aiSuggestionsCount}
                onChange={(e) => setAiSuggestionsCount(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 text-xs px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              >
                <option value="4">4 tasks (Concise)</option>
                <option value="8">8 tasks (Standard)</option>
                <option value="12">12 tasks (Deep backlog)</option>
              </select>
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Automatic Risk Detection</span>
                <span className="text-[11px] text-slate-500">
                  Run heuristic risk scans when opening project analytics workspaces.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoRiskScan}
                onChange={(e) => setAutoRiskScan(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
              />
            </label>
          </div>
        </Card>

        {/* Design System & Theme Info */}
        <Card className="p-6">
          <div className="flex items-center gap-2 text-[#0F766E] mb-4">
            <Palette className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Design System: Minimal Teal + White</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 text-center">
              <div className="w-6 h-6 rounded-md bg-[#0F766E] mx-auto mb-1.5" />
              <span className="font-bold text-slate-900 block">Primary Teal</span>
              <span className="text-[10px] text-slate-400">#0F766E</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 text-center">
              <div className="w-6 h-6 rounded-md bg-[#14B8A6] mx-auto mb-1.5" />
              <span className="font-bold text-slate-900 block">Supporting Teal</span>
              <span className="text-[10px] text-slate-400">#14B8A6</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 text-center">
              <div className="w-6 h-6 rounded-md bg-[#CCFBF1] border mx-auto mb-1.5" />
              <span className="font-bold text-slate-900 block">Light Teal</span>
              <span className="text-[10px] text-slate-400">#CCFBF1</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 text-center">
              <div className="w-6 h-6 rounded-md bg-[#F8FAFC] border mx-auto mb-1.5" />
              <span className="font-bold text-slate-900 block">Surface</span>
              <span className="text-[10px] text-slate-400">#F8FAFC</span>
            </div>
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" icon={Save}>
            Save All Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
