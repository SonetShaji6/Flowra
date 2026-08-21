import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  FolderKanban,
  CheckSquare,
  Activity as ActivityIcon,
  Search,
  Sparkles,
  UserCheck,
  UserX,
} from 'lucide-react';
import { adminService } from '../../services/extra.service';
import {
  Card,
  KPICard,
  Badge,
  Button,
  Avatar,
  LoadingSpinner,
} from '../../components/ui';

export const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, activitiesData] = await Promise.all([
        adminService.getStatistics().catch(() => null),
        adminService.getUsers().catch(() => []),
        adminService.getActivities().catch(() => []),
      ]);
      setStats(statsData);
      setUsers(usersData || []);
      setActivities(activitiesData || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminService.updateUserStatus(userId, !currentStatus);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u))
      );
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err.message || 'Failed to change role.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading system administrator dashboard..." />;
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#CCFBF1] text-[#0F766E]">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Admin Console</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage global workspace users, review security parameters, and audit system activities.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Platform Users"
          value={stats?.users?.total ?? users.length}
          subtitle={`${stats?.users?.active ?? 0} active accounts`}
          icon={Users}
        />
        <KPICard
          title="Total Projects"
          value={stats?.projects?.total ?? 0}
          subtitle={`${stats?.projects?.active ?? 0} active`}
          icon={FolderKanban}
        />
        <KPICard
          title="Total Deliverables"
          value={stats?.tasks?.total ?? 0}
          subtitle={`${stats?.tasks?.completed ?? 0} completed`}
          icon={CheckSquare}
        />
        <KPICard
          title="Audit Events"
          value={stats?.system?.totalActivities ?? activities.length}
          subtitle="Chronological trail"
          icon={ActivityIcon}
        />
      </div>

      {/* User Management Section */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              User Management ({filteredUsers.length})
            </h2>
            <p className="text-xs text-slate-500">Manage account access, activations, and role permissions.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="PROJECT_MANAGER">Project Manager</option>
              <option value="TEAM_MEMBER">Team Member</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} size="sm" />
                      <div>
                        <span className="font-semibold text-slate-900 block">{u.name}</span>
                        <span className="text-[10px] text-slate-400">{u.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
                      <option value="TEAM_MEMBER">TEAM_MEMBER</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={u.isActive ? 'success' : 'danger'}>
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      variant={u.isActive ? 'outline' : 'secondary'}
                      onClick={() => handleToggleStatus(u._id, u.isActive)}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
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
