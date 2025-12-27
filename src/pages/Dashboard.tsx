import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessagesSquare, Users } from 'lucide-react';
import PublicChat from '@/components/chat/PublicChat';
import StudentsOnline from '@/components/users/StudentsOnline';
import Header from '@/components/Header';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'students') {
      setActiveTab('students');
    }
  }, [searchParams]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden h-full">
          {/* Tab Navigation */}
          <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="w-full px-4 sm:px-6 py-2">
              <TabsList className="h-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full sm:w-auto">
                <TabsTrigger
                  value="chat"
                  className="flex-1 sm:flex-none data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white gap-2 rounded-md text-sm px-4 py-2 font-medium"
                >
                  <MessagesSquare className="w-4 h-4" />
                  <span>Group Chat</span>
                </TabsTrigger>
                <TabsTrigger
                  value="students"
                  className="flex-1 sm:flex-none data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white gap-2 rounded-md text-sm px-4 py-2 font-medium"
                >
                  <Users className="w-4 h-4" />
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
