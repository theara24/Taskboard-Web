import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useIssueStore } from '../store/issueStore';
import { useUIStore } from '../store/uiStore';
import { UserAvatar } from '../components/common/UserAvatar';
import { Button } from '../components/common/Button';
import { LogOut, UserCheck, Shield, CheckCircle2, Clock, Flame } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, users, switchUser, logout } = useAuthStore();
  const { issues } = useIssueStore();
  const { showToast } = useUIStore();

  if (!currentUser) return null;

  const assignedIssues = issues.filter((i) => i.assigneeId === currentUser.id);
  const completedAssigned = assignedIssues.filter((i) => i.status === 'DONE').length;
  const inProgressAssigned = assignedIssues.filter((i) => i.status === 'IN_PROGRESS').length;
  const criticalAssigned = assignedIssues.filter(
    (i) => i.priority === 'CRITICAL' && i.status !== 'DONE',
  ).length;

  const handleLogout = () => {
    logout();
    showToast('info', 'Logged out');
    navigate('/login');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          User Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Personal account details and performance statistics
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <UserAvatar user={currentUser} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{currentUser.name}</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
                <Shield className="w-3 h-3 text-brand-600" />
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">ID: {currentUser.id}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-rose-600 hover:bg-rose-50"
          leftIcon={<LogOut className="w-4 h-4" />}
        >
          Sign Out
        </Button>
      </div>

      {/* Personal Assignment Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Assigned Issues
            </span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {assignedIssues.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {inProgressAssigned} currently in progress
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Resolved Work
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {completedAssigned}
          </div>
          <p className="text-xs text-slate-400 mt-1">Done issues</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Critical Assigned
            </span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600">
            {criticalAssigned}
          </div>
          <p className="text-xs text-slate-400 mt-1">Needs urgent attention</p>
        </div>
      </div>

      {/* Demo Persona Switcher */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
          Switch Demo Persona
        </h3>
        <p className="text-xs text-slate-500">
          Easily test different user perspectives, roles, and permissions in this frontend prototype.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                switchUser(u.id);
                showToast('success', `Switched to ${u.name}`);
              }}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                u.id === currentUser.id
                  ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500/30'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserAvatar user={u} size="sm" />
                <div>
                  <div className="text-xs font-bold text-slate-800">{u.name}</div>
                  <div className="text-[11px] text-slate-400">{u.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                  {u.role}
                </span>
                {u.id === currentUser.id && (
                  <UserCheck className="w-4 h-4 text-brand-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
