import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Sparkles,
  BarChart3,
  Bell,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
  Menu,
  X,
  Search,
  Plus,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/collaboration.service';
import { Avatar, Badge, Button } from '../components/ui';

export const AppLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (err) {
        // silent fail for polling
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'AI Assistant', path: '/ai', icon: Sparkles, badge: 'Smart' },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Notifications', path: '/notifications', icon: Bell, count: unreadCount },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Console', path: '/admin', icon: ShieldCheck, admin: true });
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] flex items-center justify-center text-white font-bold text-base shadow-sm">
                F
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-900 tracking-tight leading-none">Flowra</span>
                <span className="text-[10px] font-medium text-slate-400 mt-0.5 tracking-wider uppercase">
                  Project OS
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Workspace
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#CCFBF1] text-[#0F766E] font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-current" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-[#0F766E] text-white">
                      {item.badge}
                    </span>
                  )}
                  {item.count > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-600 text-white">
                      {item.count}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* User Card & Logout in Sidebar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div
            className="flex items-center justify-between p-2 rounded-xl hover:bg-white hover:shadow-xs transition-all cursor-pointer"
            onClick={() => navigate('/profile')}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar name={user?.name} size="sm" />
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-slate-900 truncate">{user?.name}</span>
                <span className="text-[10px] text-slate-500 capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/90 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks, projects, or AI..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    navigate(`/tasks?search=${encodeURIComponent(e.target.value.trim())}`);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Shortcut Button */}
            <Button
              size="sm"
              variant="secondary"
              icon={Sparkles}
              onClick={() => navigate('/ai')}
              className="hidden sm:inline-flex"
            >
              AI Assistant
            </Button>

            {/* Notifications Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-600 ring-2 ring-white" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl py-3 z-50 animate-fade-in">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-[#0F766E] hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif._id}
                          className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                            !notif.isRead ? 'bg-[#F0FDFA]' : ''
                          }`}
                          onClick={() => {
                            setNotificationsOpen(false);
                            navigate('/notifications');
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-900">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6">No notifications yet.</p>
                    )}
                  </div>
                  <div className="pt-2 px-4 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate('/notifications');
                      }}
                      className="text-xs font-semibold text-[#0F766E] hover:underline"
                    >
                      View all notifications &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <div
                className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-slate-100 transition-colors"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <Avatar name={user?.name} size="sm" />
              </div>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 text-left"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    Profile & Account
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 text-left"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-400" />
                    Settings
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/admin');
                      }}
                      className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 text-left"
                    >
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      Admin Console
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 text-left border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Main Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
