import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { analyticsService } from '../../services/extra.service';
import {
  Card,
  KPICard,
  LoadingSpinner,
  Badge,
  Avatar,
} from '../../components/ui';

const STATUS_COLORS = {
  TODO: '#94A3B8',
  IN_PROGRESS: '#3B82F6',
  REVIEW: '#F59E0B',
  COMPLETED: '#10B981',
};

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [teamWorkload, setTeamWorkload] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [overviewData, teamData] = await Promise.all([
          analyticsService.getOverview().catch(() => null),
          analyticsService.getTeamAnalytics().catch(() => []),
        ]);
        setData(overviewData);
        setTeamWorkload(teamData || []);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Computing workspace analytics & charts..." />;
  }

  const overview = data?.overview || {};
  const statusData = data?.taskStatusBreakdown?.map((item) => ({
    name: item.status,
    count: item.count,
  })) || [
    { name: 'TODO', count: 0 },
    { name: 'IN_PROGRESS', count: 0 },
    { name: 'REVIEW', count: 0 },
    { name: 'COMPLETED', count: 0 },
  ];

  const priorityData = data?.taskPriorityBreakdown?.map((item) => ({
    name: item.priority,
    count: item.count,
  })) || [
    { name: 'LOW', count: 0 },
    { name: 'MEDIUM', count: 0 },
    { name: 'HIGH', count: 0 },
    { name: 'CRITICAL', count: 0 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top Banner */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Workspace Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Delivery performance, task status breakdown, and team workload distribution.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Projects"
          value={overview.totalProjects ?? 0}
          subtitle={`${overview.activeProjects ?? 0} active in flight`}
          icon={BarChart3}
        />
        <KPICard
          title="Total Deliverables"
          value={overview.totalTasks ?? 0}
          subtitle="Across workspace"
          icon={CheckCircle2}
        />
        <KPICard
          title="Overdue Tasks"
          value={overview.overdueTasks ?? 0}
          subtitle="Attention needed"
          icon={AlertTriangle}
        />
        <KPICard
          title="Team Members"
          value={overview.totalUsers ?? 0}
          subtitle="Active contributors"
          icon={Users}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Donut */}
        <Card className="p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
            Tasks by Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {statusData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] || '#0F766E'}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Priority Bar Chart */}
        <Card className="p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
            Tasks by Priority
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0F766E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Team Workload Table */}
      <Card className="p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
          Team Member Workload
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Assigned Open Tasks</th>
                <th className="py-3 px-4">Capacity Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamWorkload.map((m) => (
                <tr key={m.userId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={m.name} size="sm" />
                      <div>
                        <span className="font-semibold text-slate-900 block">{m.name}</span>
                        <span className="text-[10px] text-slate-400">{m.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge size="xs" variant="teal">
                      {m.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {m.assignedTasksCount} tasks
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      size="xs"
                      variant={
                        m.assignedTasksCount > 4
                          ? 'warning'
                          : m.assignedTasksCount > 0
                          ? 'success'
                          : 'default'
                      }
                    >
                      {m.assignedTasksCount > 4
                        ? 'High Load'
                        : m.assignedTasksCount > 0
                        ? 'Optimal'
                        : 'Available'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
