import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserCardProps {
  name: string;
  photoURL?: string;
  status: 'online' | 'offline';
  customStatus?: string;
  onClick?: () => void;
  isActive?: boolean;
}

const UserCard = ({
  name,
  photoURL,
  status,
  customStatus,
  onClick,
  isActive,
}: UserCardProps) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group',
        'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-800 dark:hover:to-slate-700',
        'hover:shadow-md',
        isActive && 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 shadow-md'
      )}
    >
      <div className="relative">
        <Avatar className="w-12 h-12 ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-blue-500 transition-all">
          <AvatarImage src={photoURL} alt={name} />
          <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            'absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 transition-all',
            status === 'online' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-slate-400'
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {name}
        </p>
        {customStatus ? (
          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{customStatus}</p>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-500">
            {status === 'online' ? 'Active now' : 'Offline'}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserCard;
