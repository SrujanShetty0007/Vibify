import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GraduationCap, MessagesSquare, Users, LogOut, ChevronDown } from 'lucide-react';
import PublicChat from '@/components/chat/PublicChat';
import StudentsOnline from '@/components/users/StudentsOnline';

const Dashboard = () => {
  const { userProfile, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('chat');

  // Check URL for tab parameter on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'students') {
      setActiveTab('students');
    }
  }, [searchParams]);

  const initials = userProfile?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                  <span className="text-orange-500">Vibify</span> for MITK
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Campus Community</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1.5 sm:gap-2 h-auto py-1.5 px-1.5 sm:px-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex-shrink-0">
                  <Avatar className="w-7 h-7 sm:w-8 sm:h-8 ring-2 ring-blue-500/20">
                    <AvatarImage src={userProfile?.photoURL} alt={userProfile?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start min-w-0">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 max-w-[120px] lg:max-w-[150px] truncate">
                      {userProfile?.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 max-w-[120px] lg:max-w-[150px] truncate">
                      {userProfile?.email}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2 md:hidden border-b border-slate-200 dark:border-slate-700 mb-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {userProfile?.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {userProfile?.email}
                  </p>
                </div>
                <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden h-full">
          {/* Tabs Navigation */}
          <div className="flex-shrink-0 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <div className="w-full px-3 sm:px-4 lg:px-6">
              <TabsList className="h-11 sm:h-12 bg-transparent gap-1 sm:gap-2 w-full justify-start">
                <TabsTrigger
                  value="chat"
                  className="flex-1 sm:flex-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 gap-1.5 sm:gap-2 rounded-xl transition-all text-xs sm:text-sm px-3 sm:px-4"
                >
                  <MessagesSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:hidden">Group</span>
                  <span className="hidden sm:inline">Group Chat</span>
                </TabsTrigger>
                <TabsTrigger
                  value="students"
                  className="flex-1 sm:flex-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 gap-1.5 sm:gap-2 rounded-xl transition-all text-xs sm:text-sm px-3 sm:px-4"
                >
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Users</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Tab Content */}
          <TabsContent value="chat" className="flex-1 m-0 h-full overflow-hidden data-[state=inactive]:hidden">
            <PublicChat />
          </TabsContent>

          <TabsContent value="students" className="flex-1 m-0 h-full overflow-hidden data-[state=inactive]:hidden">
            <StudentsOnline />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
