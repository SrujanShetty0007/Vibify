import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserCardProps {
  name: string;
  photoURL?: string;
  status: 'online' | 'offline';
  customStatus?: string;
  onClick?: () => void;
  isActive?: boolean;
  lastMessageTime?: Date;
  lastMessageByMe?: boolean;
  unreadCount?: number;
}

const formatTimeAgo = (date: Date, sentByMe: boolean): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const prefix = sentByMe ? 'Sent ' : 'Received ';

  if (diffMins < 1) return prefix + 'just now';
  if (diffMins === 1) return prefix + '1 min ago';
  if (diffMins < 60) return prefix + `${diffMins} mins ago`;
  if (diffHours === 1) return prefix + '1 hour ago';
  if (diffHours < 24) return prefix + `${diffHours} hours ago`;
  if (diffDays === 1) return prefix + '1 day ago';
  if (diffDays < 7) return prefix + `${diffDays} days ago`;
  return prefix + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const UserCard = ({
  name,
  photoURL,
  status,
  customStatus,
  onClick,
  isActive,
  lastMessageTime,
  lastMessageByMe,
  unreadCount = 0,
}: UserCardProps) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const hasUnread = unreadCount > 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-b-0',
        'hover:bg-slate-50 dark:hover:bg-slate-900',
        isActive && 'bg-slate-50 dark:bg-slate-900'
      )}
    >
      <div className="relative">
        <Avatar className="w-10 h-10">
          <AvatarImage src={photoURL} alt={name} />
          <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-950',
            status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium text-slate-900 dark:text-white truncate',
          hasUnread && 'font-semibold'
        )}>
          {name}
        </p>
        {customStatus ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{customStatus}</p>
        ) : (
          <p className={cn(
            'text-xs text-slate-500 dark:text-slate-400',
            hasUnread && 'text-slate-700 dark:text-slate-300 font-medium'
          )}>
            {hasUnread ? 'New message' : status === 'online' ? 'Active now' : 'Offline'}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">
        {hasUnread ? (
          <div className="min-w-[20px] h-5 px-1.5 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-[11px] font-semibold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
        ) : lastMessageTime ? (
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {lastMessageByMe !== undefined
              ? formatTimeAgo(lastMessageTime, lastMessageByMe)
              : '?'
            }
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default UserCard;
