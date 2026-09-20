import React from 'react';
import { User } from '../../types';
import { cn } from '../../utils/cn';

interface UserAvatarProps {
  user?: User | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'sm',
  showName = false,
  className,
}) => {
  if (!user) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <div
          className={cn(
            'rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-medium border border-dashed border-slate-300',
            size === 'xs' && 'w-5 h-5 text-[10px]',
            size === 'sm' && 'w-6 h-6 text-xs',
            size === 'md' && 'w-8 h-8 text-sm',
            size === 'lg' && 'w-10 h-10 text-base',
          )}
          title="Unassigned"
        >
          ?
        </div>
        {showName && <span className="text-xs text-slate-500">Unassigned</span>}
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const colorPalette = [
    'bg-blue-600 text-white',
    'bg-emerald-600 text-white',
    'bg-purple-600 text-white',
    'bg-amber-600 text-white',
    'bg-rose-600 text-white',
    'bg-indigo-600 text-white',
  ];

  // Stable hash based on user id/name
  const charCodeSum = user.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const colorClass = colorPalette[charCodeSum % colorPalette.length];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.name}
          className={cn(
            'rounded-full object-cover ring-1 ring-slate-200 shadow-sm',
            size === 'xs' && 'w-5 h-5',
            size === 'sm' && 'w-6 h-6',
            size === 'md' && 'w-8 h-8',
            size === 'lg' && 'w-10 h-10',
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-semibold shadow-sm',
            colorClass,
            size === 'xs' && 'w-5 h-5 text-[10px]',
            size === 'sm' && 'w-6 h-6 text-xs',
            size === 'md' && 'w-8 h-8 text-sm',
            size === 'lg' && 'w-10 h-10 text-base',
          )}
          title={user.name}
        >
          {initials}
        </div>
      )}
      {showName && (
        <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
          {user.name}
        </span>
      )}
    </div>
  );
};
