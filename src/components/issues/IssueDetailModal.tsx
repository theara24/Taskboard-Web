import React, { useState } from 'react';
import { useIssueStore } from '../../store/issueStore';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { UserAvatar } from '../common/UserAvatar';
import { PriorityBadge, StatusBadge, IssueTypeBadge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Calendar,
  MessageSquare,
  History,
  Trash2,
  Edit2,
  Send,
  Clock,
  User as UserIcon,
  Tag,
  CheckCircle,
} from 'lucide-react';
import { IssuePriority, IssueStatus, IssueType } from '../../types';

interface IssueDetailModalProps {
  issueId: string | null;
  onClose: () => void;
  onEdit: () => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issueId,
  onClose,
  onEdit,
}) => {
  const { currentUser } = useAuthStore();
  const { projects } = useProjectStore();
  const {
    issues,
    comments,
    activities,
    updateIssue,
    deleteIssue,
    addComment,
    deleteComment,
  } = useIssueStore();
  const { showToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [commentText, setCommentText] = useState('');
  const [isDeletingIssue, setIsDeletingIssue] = useState(false);

  const issue = issues.find((i) => i.id === issueId);
  const project = projects.find((p) => p.id === issue?.projectId);

  if (!issue) return null;

  const issueComments = comments.filter((c) => c.issueId === issue.id);
  const issueActivities = activities.filter((a) => a.issueId === issue.id);

  const handleStatusChange = (newStatus: IssueStatus) => {
    if (!currentUser) return;
    updateIssue(issue.id, { status: newStatus }, currentUser);
    showToast('info', `Status moved to ${newStatus}`);
  };

  const handlePriorityChange = (newPriority: IssuePriority) => {
    if (!currentUser) return;
    updateIssue(issue.id, { priority: newPriority }, currentUser);
    showToast('info', `Priority changed to ${newPriority}`);
  };

  const handleTypeChange = (newType: IssueType) => {
    if (!currentUser) return;
    updateIssue(issue.id, { type: newType }, currentUser);
    showToast('info', `Type changed to ${newType}`);
  };

  const handleAssigneeChange = (assigneeId: string) => {
    if (!currentUser || !project) return;
    const member = project.members.find((m) => m.userId === assigneeId);
    updateIssue(
      issue.id,
      { assigneeId: member ? member.userId : null, assignee: member ? member.user : null },
      currentUser,
    );
    showToast('info', `Assignee updated`);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;

    addComment(issue.id, currentUser, commentText.trim());
    setCommentText('');
    showToast('success', 'Comment added');
  };

  const handleDeleteIssue = () => {
    deleteIssue(issue.id);
    showToast('success', `Issue ${issue.issueKey} deleted`);
    setIsDeletingIssue(false);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={Boolean(issueId)}
        onClose={onClose}
        title=""
        maxWidth="4xl"
      >
        <div className="space-y-6 -mt-3">
          {/* Header Bar: Key, Project, Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                {issue.issueKey}
              </span>
              <span className="text-xs text-slate-400 font-medium">in</span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded">
                {project?.name || 'Project'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              >
                Edit Details
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeletingIssue(true)}
                className="text-rose-600 hover:bg-rose-50"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Main Grid: Left content, Right metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (2 Cols): Title, Description, Tabs (Comments/Activity) */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                  {issue.title}
                </h2>
                <div className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 min-h-[90px]">
                  {issue.description || (
                    <span className="text-slate-400 italic">No description provided.</span>
                  )}
                </div>
              </div>

              {/* Labels */}
              {issue.labels.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Attached Labels
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {issue.labels.map((label) => (
                      <span
                        key={label.id}
                        className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        #{label.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Discussion & Activity Section */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`flex items-center gap-2 pb-2 text-sm font-semibold transition-all relative ${
                      activeTab === 'comments'
                        ? 'text-brand-600 border-b-2 border-brand-600 -mb-[10px]'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Comments ({issueComments.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`flex items-center gap-2 pb-2 text-sm font-semibold transition-all relative ${
                      activeTab === 'activity'
                        ? 'text-brand-600 border-b-2 border-brand-600 -mb-[10px]'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    Activity History ({issueActivities.length})
                  </button>
                </div>

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                  <div className="mt-4 space-y-4">
                    {/* Add comment form */}
                    <form onSubmit={handleAddComment} className="flex gap-3">
                      <UserAvatar user={currentUser} size="sm" />
                      <div className="flex-1">
                        <textarea
                          rows={2}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Leave a comment or review note..."
                          className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none"
                        />
                        <div className="flex justify-end mt-1.5">
                          <Button
                            type="submit"
                            size="sm"
                            variant="primary"
                            disabled={!commentText.trim()}
                            leftIcon={<Send className="w-3.5 h-3.5" />}
                          >
                            Post Comment
                          </Button>
                        </div>
                      </div>
                    </form>

                    {/* Comments list */}
                    <div className="space-y-3 pt-2">
                      {issueComments.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-3 text-center">
                          No comments yet. Start the discussion above.
                        </p>
                      ) : (
                        issueComments.map((comment) => (
                          <div
                            key={comment.id}
                            className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <UserAvatar user={comment.author} size="xs" />
                                <span className="text-xs font-semibold text-slate-800">
                                  {comment.author.name}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              {currentUser?.id === comment.authorId && (
                                <button
                                  onClick={() => deleteComment(comment.id)}
                                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                  title="Delete comment"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-slate-700 pl-7 leading-relaxed">
                              {comment.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div className="mt-4 space-y-2.5">
                    {issueActivities.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-3 text-center">
                        No activity recorded yet.
                      </p>
                    ) : (
                      issueActivities.map((act) => (
                        <div
                          key={act.id}
                          className="flex items-start gap-2.5 text-xs text-slate-600 py-1.5 border-l-2 border-slate-200 pl-3 ml-2"
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium text-slate-800">
                              {act.user.name}
                            </span>{' '}
                            {act.action === 'STATUS_CHANGED' ? (
                              <span>
                                changed status from{' '}
                                <span className="font-semibold text-slate-700">
                                  {act.oldValue}
                                </span>{' '}
                                to{' '}
                                <span className="font-semibold text-brand-600">
                                  {act.newValue}
                                </span>
                              </span>
                            ) : act.action === 'PRIORITY_CHANGED' ? (
                              <span>
                                changed priority to{' '}
                                <span className="font-semibold">{act.newValue}</span>
                              </span>
                            ) : (
                              <span>{act.newValue || act.action}</span>
                            )}
                            <span className="text-[11px] text-slate-400 ml-2">
                              {new Date(act.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (1 Col): Metadata Panel */}
            <div className="space-y-5 bg-slate-50/60 p-5 rounded-2xl border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-200">
                Attributes
              </h3>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Status
                </label>
                <div className="flex items-center gap-2">
                  <StatusBadge status={issue.status} />
                  <select
                    value={issue.status}
                    onChange={(e) => handleStatusChange(e.target.value as IssueStatus)}
                    className="text-xs rounded-lg border border-slate-200 bg-white py-1 px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="BACKLOG">Backlog</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Priority
                </label>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={issue.priority} />
                  <select
                    value={issue.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as IssuePriority)}
                    className="text-xs rounded-lg border border-slate-200 bg-white py-1 px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Issue Type
                </label>
                <div className="flex items-center gap-2">
                  <IssueTypeBadge type={issue.type} />
                  <select
                    value={issue.type}
                    onChange={(e) => handleTypeChange(e.target.value as IssueType)}
                    className="text-xs rounded-lg border border-slate-200 bg-white py-1 px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="TASK">Task</option>
                    <option value="BUG">Bug</option>
                    <option value="FEATURE">Feature</option>
                  </select>
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Assignee
                </label>
                <div className="flex items-center gap-2 mb-1.5">
                  <UserAvatar user={issue.assignee} size="xs" showName />
                </div>
                <select
                  value={issue.assigneeId || ''}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white py-1 px-2 text-slate-700 focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {project?.members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reporter */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Reporter
                </label>
                <div className="flex items-center gap-2">
                  <UserAvatar user={issue.reporter} size="xs" showName />
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Due Date
                </label>
                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {issue.dueDate
                      ? new Date(issue.dueDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'No due date set'}
                  </span>
                </div>
              </div>

              {/* Timestamps */}
              <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-400 space-y-1">
                <div>Created: {new Date(issue.createdAt).toLocaleDateString()}</div>
                <div>Updated: {new Date(issue.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeletingIssue}
        onClose={() => setIsDeletingIssue(false)}
        onConfirm={handleDeleteIssue}
        title="Delete Issue"
        message={`Are you sure you want to permanently delete issue ${issue.issueKey}? This action cannot be undone.`}
        confirmText="Delete Issue"
        isDestructive
      />
    </>
  );
};
