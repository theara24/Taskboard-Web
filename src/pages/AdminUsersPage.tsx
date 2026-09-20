import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { UserAvatar } from '../components/common/UserAvatar';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  FolderKanban,
  ListTodo,
  MessageSquare,
  LifeBuoy,
  CheckCircle2,
  Loader2,
  UserCheck,
  UserX,
  Crown,
} from 'lucide-react';
import { Role } from '../types';

export const AdminUsersPage: React.FC = () => {
  const {
    users,
    usersPagination,
    fetchUsers,
    selectedUserDetail,
    fetchUserDetail,
    updateUserRole,
    isLoading,
  } = useAdminStore();
  const { showToast } = useUIStore();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [roleToConfirm, setRoleToConfirm] = useState<{ userId: string; role: Role; name: string } | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  useEffect(() => {
    fetchUsers({
      search: search || undefined,
      role: roleFilter !== 'ALL' ? (roleFilter as Role) : undefined,
    });

    const handleFocus = () => {
      if (!document.hidden) {
        fetchUsers(
          {
            search: search || undefined,
            role: roleFilter !== 'ALL' ? (roleFilter as Role) : undefined,
          },
          true,
        );
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchUsers(
          {
            search: search || undefined,
            role: roleFilter !== 'ALL' ? (roleFilter as Role) : undefined,
          },
          true,
        );
      }
    }, 6000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      clearInterval(interval);
    };
  }, [fetchUsers, search, roleFilter]);

  const handleOpenUserDetail = (userId: string) => {
    setSelectedUserId(userId);
    fetchUserDetail(userId);
  };

  const handleConfirmRoleChange = async () => {
    if (!roleToConfirm) return;

    setIsUpdatingRole(true);
    const updated = await updateUserRole(roleToConfirm.userId, roleToConfirm.role);
    setIsUpdatingRole(false);

    if (updated) {
      showToast('success', `${roleToConfirm.name}'s system role updated to ${roleToConfirm.role}`);
      setRoleToConfirm(null);
      if (selectedUserId === roleToConfirm.userId) {
        fetchUserDetail(roleToConfirm.userId);
      }
    } else {
      showToast('error', 'Failed to update system role');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Platform Admin
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            User Management & System Roles
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Inspect all registered users across the TaskBoard platform and manage administrative privileges
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500">Filter Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none font-medium"
          >
            <option value="ALL">All Roles ({usersPagination.total})</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {isLoading && users.length === 0 ? (
        <div className="flex justify-center p-16">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="There are currently no registered users matching your filter criteria."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">System Role</th>
                <th className="py-3.5 px-4">Provider</th>
                <th className="py-3.5 px-4">Owned Projects</th>
                <th className="py-3.5 px-4">Joined</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {users.map((u: any) => {
                const isPrimaryAdmin = u.email === 'admin@taskboard.io';
                const isAdmin = u.role === 'ADMIN';

                return (
                  <tr
                    key={u.id}
                    onClick={() => handleOpenUserDetail(u.id)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={u} className="w-9 h-9" />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {u.name}
                            {isPrimaryAdmin && (
                              <span title="Primary Administrator">
                                <Crown className="w-3.5 h-3.5 text-amber-500" />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {isAdmin ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 inline-flex items-center gap-1">
                          <Shield className="w-3 h-3" /> ADMIN
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          USER
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {u.provider || 'LOCAL'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {u._count?.ownedProjects ?? 0} projects
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenUserDetail(u.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                        >
                          View Profile
                        </Button>

                        {!isPrimaryAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setRoleToConfirm({
                                userId: u.id,
                                role: isAdmin ? 'USER' : 'ADMIN',
                                name: u.name,
                              })
                            }
                            className={isAdmin ? 'text-rose-600 hover:bg-rose-50' : 'text-purple-600 hover:bg-purple-50'}
                          >
                            {isAdmin ? 'Demote to USER' : 'Promote to ADMIN'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUserDetail && (
        <Modal
          isOpen={Boolean(selectedUserId)}
          onClose={() => setSelectedUserId(null)}
          title={`User Profile: ${selectedUserDetail.name}`}
        >
          <div className="space-y-6">
            {/* Header Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-4">
              <UserAvatar user={selectedUserDetail} className="w-14 h-14 text-xl" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {selectedUserDetail.name}
                  {selectedUserDetail.email === 'admin@taskboard.io' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500 text-white tracking-wider">
                      PRIMARY ADMIN
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedUserDetail.email}</p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    System Role: {selectedUserDetail.role}
                  </span>
                  <span className="text-slate-400">• Provider: {selectedUserDetail.provider || 'LOCAL'}</span>
                </div>
              </div>
            </div>

            {/* Platform Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-center">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Owned Projects</div>
                <div className="text-xl font-extrabold text-blue-900 dark:text-blue-200 mt-0.5">
                  {selectedUserDetail.ownedProjects?.length ?? 0}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 text-center">
                <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Joined Projects</div>
                <div className="text-xl font-extrabold text-purple-900 dark:text-purple-200 mt-0.5">
                  {selectedUserDetail.memberships?.length ?? 0}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 text-center">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Issues Created</div>
                <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200 mt-0.5">
                  {selectedUserDetail._count?.reportedIssues ?? 0}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 text-center">
                <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Support Tickets</div>
                <div className="text-xl font-extrabold text-amber-900 dark:text-amber-200 mt-0.5">
                  {selectedUserDetail._count?.supportTickets ?? 0}
                </div>
              </div>
            </div>

            {/* Project Relationships (Demonstrates SYSTEM ROLE vs PROJECT ROLE) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Project Relationships & Roles
              </h4>

              {selectedUserDetail.projectRelationships && selectedUserDetail.projectRelationships.length > 0 ? (
                <div className="space-y-2">
                  {selectedUserDetail.projectRelationships.map((p: any) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</span>
                        <span className="ml-2 font-mono text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-600">
                          {p.key}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                          p.role === 'OWNER'
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        Project Role: {p.role}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">User is not associated with any projects yet.</p>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setSelectedUserId(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Role Change Confirmation */}
      {roleToConfirm && (
        <ConfirmDialog
          isOpen={Boolean(roleToConfirm)}
          onClose={() => setRoleToConfirm(null)}
          onConfirm={handleConfirmRoleChange}
          title={`Confirm System Role Update`}
          message={`Are you sure you want to change ${roleToConfirm.name}'s system role to ${roleToConfirm.role}?`}
          confirmText={`Update Role to ${roleToConfirm.role}`}
          isDestructive={roleToConfirm.role === 'ADMIN'}
          isLoading={isUpdatingRole}
        />
      )}
    </div>
  );
};
