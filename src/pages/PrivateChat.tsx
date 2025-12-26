import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    collection,
    query,
    orderBy,
    limit,
    addDoc,
    onSnapshot,
    Timestamp,
    doc,
    getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    senderId: string;
    createdAt: Date;
    expiresAt: Date;
}

interface OtherUser {
    uid: string;
    name: string;
    email: string;
    photoURL: string;
    status: 'online' | 'offline';
}

const PrivateChat = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [messages, setMessages] = useState<Message[]>([]);
    const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user, userProfile } = useAuth();

    const handleBack = () => {
        const from = location.state?.from;
        if (from === 'students') {
            navigate('/?tab=students');
        } else {
            navigate('/');
        }
    };

    const getChatId = (uid1: string, uid2: string) => {
        return [uid1, uid2].sort().join('_');
    };

    useEffect(() => {
        if (!userId || !user) {
            navigate('/');
            return;
        }

        // Fetch other user's data
        const fetchUser = async () => {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setOtherUser({
                    uid: userDoc.id,
                    name: data.name,
                    email: data.email,
                    photoURL: data.photoURL,
                    status: data.status,
                });
            }
        };

        fetchUser();

        const chatId = getChatId(user.uid, userId);
        const messagesRef = collection(db, 'privateChats', chatId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(50));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = new Date();
            const msgs = snapshot.docs
                .map((doc) => {
                    const data = doc.data();
                    const createdAt = data.createdAt?.toDate() || new Date();
                    const expiresAt = data.expiresAt?.toDate() || new Date();
                    return {
                        id: doc.id,
                        text: data.text,
                        senderId: data.senderId,
                        createdAt,
                        expiresAt,
                    };
                })
                .filter((msg) => msg.expiresAt > now)
                .reverse();

            setMessages(msgs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, user, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!user || !userProfile || !userId) return;

        const chatId = getChatId(user.uid, userId);
        const now = Timestamp.now();
        const expiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

        await addDoc(collection(db, 'privateChats', chatId, 'messages'), {
            text,
            senderId: user.uid,
            createdAt: now,
            expiresAt,
        });
    };

    if (!otherUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Loading chat...</p>
                </div>
            </div>
        );
    }

    const initials = otherUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
            {/* Header - Fixed */}
            <header className="flex-shrink-0 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                <div className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBack}
                            className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>

                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="relative flex-shrink-0">
                                <Avatar className="w-9 h-9 sm:w-11 sm:h-11 ring-2 ring-blue-500/20">
                                    <AvatarImage src={otherUser.photoURL} alt={otherUser.name} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs sm:text-sm font-semibold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <span
                                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white dark:border-slate-900 ${otherUser.status === 'online' ? 'bg-green-500' : 'bg-slate-400'
                                        }`}
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                                    {otherUser.name}
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {otherUser.status === 'online' ? 'Active now' : 'Offline'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Info Banner */}
            <div className="flex-shrink-0 mx-3 sm:mx-6 mt-3 sm:mt-4 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800/50 dark:to-slate-700/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                    <span className="font-medium">Private conversation • Messages auto-delete after 7 days</span>
                </div>
            </div>

            {/* Messages Container - Scrollable */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Loading messages...</p>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center py-8 sm:py-12 px-4">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-lg">
                                <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                                    <AvatarImage src={otherUser.photoURL} alt={otherUser.name} />
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-sm">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-semibold mb-1">No messages yet</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Start the conversation with {otherUser.name.split(' ')[0]}!
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <ChatMessage
                                key={msg.id}
                                text={msg.text}
                                senderName={msg.senderId === user?.uid ? userProfile?.name || 'You' : otherUser.name}
                                senderPhoto={msg.senderId === user?.uid ? userProfile?.photoURL : otherUser.photoURL}
                                createdAt={msg.createdAt}
                                isOwnMessage={msg.senderId === user?.uid}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Bar - Fixed at Bottom */}
            <div className="flex-shrink-0 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                <ChatInput onSend={sendMessage} placeholder={`Message ${otherUser.name.split(' ')[0]}...`} />
            </div>
        </div>
    );
};

export default PrivateChat;
