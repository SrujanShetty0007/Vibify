import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GraduationCap, Home, LogOut, Settings, User, ArrowLeft, ChevronDown, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  chatUserPhoto?: string;
  chatUserStatus?: 'online' | 'offline';
}

const Header = ({ showBack, onBack, title, subtitle, chatUserPhoto, chatUserStatus }: HeaderProps) => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
  };

  const initials = userProfile?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const chatUserInitials = title
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const isHome = location.pathname === '/';
  const isPrivateChat = chatUserPhoto !== undefined;

  return (
    <header className="sticky top-0 z-50 flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Left Section */}
          <div className="flex items-center gap-2 min-w-0">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </Button>
            )}

            {/* Logo or Chat User Avatar */}
            {isPrivateChat ? (
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={chatUserPhoto} alt={title} />
                    <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium">
                      {chatUserInitials}
                    </AvatarFallback>
                  </Avatar>
                  {chatUserStatus && (
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${chatUserStatus === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{title}</p>
                  {subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
                  )}
                </div>
              </div>
            ) : (
              <div
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => navigate('/')}
              >
                <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white dark:text-slate-900" />
                </div>
                {!title ? (
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">Vibify</span>
                ) : (
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{title}</p>
                    {subtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1.5">
            {/* Home Button */}
            {!isHome && !showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Home className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </Button>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors gap-2"
                >
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={userProfile?.photoURL} alt={userProfile?.name} />
                    <AvatarFallback className="bg-blue-600 text-white text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                    {userProfile?.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-lg"
              >
                <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{userProfile?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userProfile?.email}</p>
                </div>
                <div className="p-1">
                  <DropdownMenuItem className="cursor-pointer rounded-md px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <User className="w-4 h-4 mr-2.5 text-slate-500 dark:text-slate-400" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer rounded-md px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Settings className="w-4 h-4 mr-2.5 text-slate-500 dark:text-slate-400" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={toggleDarkMode}
                    className="cursor-pointer rounded-md px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {darkMode ? (
                      <Sun className="w-4 h-4 mr-2.5 text-slate-500 dark:text-slate-400" />
                    ) : (
                      <Moon className="w-4 h-4 mr-2.5 text-slate-500 dark:text-slate-400" />
                    )}
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                <div className="p-1">
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer rounded-md px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <LogOut className="w-4 h-4 mr-2.5" />
                    Sign out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
