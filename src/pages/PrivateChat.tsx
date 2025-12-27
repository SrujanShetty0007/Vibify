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
import { Lock } from 'lucide-react';
import Header from '@/components/Header';

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
            navigate('/dashboard?tab=students');
        } else {
            navigate('/dashboard?tab=chat');
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
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Loading chat...</p>
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
        <div className="h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
            <Header
                showBack
                onBack={handleBack}
                title={otherUser.name}
                subtitle={otherUser.status === 'online' ? 'Active now' : 'Offline'}
                chatUserPhoto={otherUser.photoURL}
                chatUserStatus={otherUser.status}
            />

            {/* Info Banner */}
            <div className="flex-shrink-0 mx-4 sm:mx-6 mt-3 px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span>Private conversation • Messages auto-delete after 7 days</span>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-slate-600 dark:text-slate-400">Loading messages...</p>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center py-8 px-4">
                            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={otherUser.photoURL} alt={otherUser.name} />
                                    <AvatarFallback className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <p className="text-base text-slate-700 dark:text-slate-300 font-medium mb-1">No messages yet</p>
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

            {/* Input Bar */}
            <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <ChatInput onSend={sendMessage} placeholder={`Message ${otherUser.name.split(' ')[0]}...`} />
            </div>
        </div>
    );
};

export default PrivateChat;
