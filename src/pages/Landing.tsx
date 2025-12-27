import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight, MessageSquare, Github, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';

const Landing = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [onlineCount, setOnlineCount] = useState(0);

    useEffect(() => {
        const q = query(collection(db, 'users'), where('status', '==', 'online'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setOnlineCount(snapshot.size);
        });
        return () => unsubscribe();
    }, []);

    const firstName = userProfile?.name?.split(' ')[0] || 'User';

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
            <Header />

            {/* Main Content */}
            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
                {/* Hero */}
                <div className="text-center mb-12">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Welcome back</p>
                    <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white mb-3">
                        Hey, {firstName} 👋
                    </h1>
                    <p className="text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                        Connect with your classmates. Start chatting now.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {/* Group Chat Card */}
                    <div
                        onClick={() => navigate('/dashboard?tab=chat')}
                        className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 flex flex-col h-full"
                    >
                        <div className="w-11 h-11 rounded-lg bg-blue-600 flex items-center justify-center mb-4">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">
                            Group Chat
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">
                            Join the public room where everyone can chat together.
                        </p>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-10 mt-4">
                            Enter Chat
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>

                    {/* Users Online Card */}
                    <div
                        onClick={() => navigate('/dashboard?tab=students')}
                        className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 flex flex-col h-full"
                    >
                        <div className="w-11 h-11 rounded-lg bg-emerald-600 flex items-center justify-center mb-4">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">
                            Users Online
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            See who's online and start private conversations.
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 flex-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                {onlineCount} online
                            </span>
                        </div>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-10 mt-4">
                            View Users
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800 py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Vibify for MITK Students
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://github.com/SrujanShetty0007"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                            <a
                                href="mailto:contact@vibify.app"
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
