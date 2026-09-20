import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';
import { useIssueStore } from '../store/issueStore';

export const IssueDetailPage: React.FC = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const { setSelectedIssueId } = useUIStore();
  const { issues } = useIssueStore();

  useEffect(() => {
    if (issueId) {
      const issue = issues.find((i) => i.id === issueId || i.issueKey === issueId.toUpperCase());
      if (issue) {
        setSelectedIssueId(issue.id);
        navigate(`/projects/${issue.projectId}/board`, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [issueId, issues, setSelectedIssueId, navigate]);

  return (
    <div className="flex items-center justify-center p-12 text-slate-400">
      Loading issue details...
    </div>
  );
};
