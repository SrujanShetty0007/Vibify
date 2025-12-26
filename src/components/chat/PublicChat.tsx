import { useEffect, useRef, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Clock, MessagesSquare } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  createdAt: Date;
  expiresAt: Date;
}

const PublicChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, userProfile } = useAuth();

  useEffect(() => {
    const q = query(
      collection(db, 'publicChats'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

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
            senderName: data.senderName,
            senderPhoto: data.senderPhoto,
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
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!user || !userProfile) return;

    const now = Timestamp.now();
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 12 * 60 * 60 * 1000));

    await addDoc(collection(db, 'publicChats'), {
      text,
      senderId: user.uid,
      senderName: userProfile.name,
      senderPhoto: userProfile.photoURL,
      createdAt: now,
      expiresAt,
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Info Banner */}
      <div className="flex-shrink-0 px-3 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-slate-700/50 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
          <span className="font-medium">Messages auto-delete after 12 hours</span>
        </div>
      </div>

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-lg">
                <MessagesSquare className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500" />
              </div>
              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-semibold mb-1">No messages yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Be the first to start the group conversation!
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                text={msg.text}
                senderName={msg.senderName}
                senderPhoto={msg.senderPhoto}
                createdAt={msg.createdAt}
                isOwnMessage={msg.senderId === user?.uid}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input - Fixed at Bottom */}
      <div className="flex-shrink-0 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <ChatInput onSend={sendMessage} placeholder="Type your message..." />
      </div>
    </div>
  );
};

export default PublicChat;
