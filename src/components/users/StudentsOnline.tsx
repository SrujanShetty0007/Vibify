import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import UserCard from './UserCard';
import { Users as UsersIcon } from 'lucide-react';

interface UserData {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  status: 'online' | 'offline';
  customStatus: string;
  lastSeen: Date;
  lastChatTime?: Date;
  lastMessageByMe?: boolean;
  unreadCount: number;
}

const StudentsOnline = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleOpenChat = (userId: string) => {
    if (user) {
      const chatId = getChatId(user.uid, userId);
      localStorage.setItem(`lastRead_${chatId}`, new Date().toISOString());
    }
    navigate(`/chat/${userId}`, { state: { from: 'students' } });
  };

  const getChatId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join('_');
  };

  useEffect(() => {
    if (!user) return;

    const usersQuery = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(
      usersQuery,
      async (snapshot) => {
        const otherUsers = snapshot.docs.filter((doc) => doc.id !== user.uid);

        const usersWithChats: UserData[] = [];

        for (const doc of otherUsers) {
          const data = doc.data();

          usersWithChats.push({
            uid: doc.id,
            name: data.name || 'Unknown',
            email: data.email || '',
            photoURL: data.photoURL || '',
            status: data.status || 'offline',
            customStatus: data.customStatus || '',
            lastSeen: data.lastSeen?.toDate() || new Date(),
            lastChatTime: undefined,
            lastMessageByMe: undefined,
            unreadCount: 0,
          });
        }

        setUsers(usersWithChats);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching users:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Set up real-time listeners for chat messages
  useEffect(() => {
    if (!user || users.length === 0) return;

    const unsubscribes: (() => void)[] = [];

    users.forEach((userData) => {
      const chatId = getChatId(user.uid, userData.uid);
      const messagesRef = collection(db, 'privateChats', chatId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'));

      const unsub = onSnapshot(q, (snapshot) => {
        const lastReadStr = localStorage.getItem(`lastRead_${chatId}`);
        const lastRead = lastReadStr ? new Date(lastReadStr) : new Date(0);

        let unreadCount = 0;
        let lastMessageTime: Date | undefined;
        let lastMessageByMe: boolean | undefined;
        const now = new Date();

        snapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate();
          const expiresAt = data.expiresAt?.toDate();

          // Skip expired messages
          if (expiresAt && expiresAt < now) return;

          // Track last message info (first non-expired message)
          if (lastMessageTime === undefined && createdAt) {
            lastMessageTime = createdAt;
            lastMessageByMe = data.senderId === user.uid;
          }

          // Count unread messages (from other user, after last read)
          if (data.senderId !== user.uid && createdAt && createdAt > lastRead) {
            unreadCount++;
          }
        });

        setUsers((prev) =>
          prev.map((u) =>
            u.uid === userData.uid
              ? { ...u, lastChatTime: lastMessageTime, lastMessageByMe, unreadCount }
              : u
          )
        );
      });

      unsubscribes.push(unsub);
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [user, users.length]);

  // Sort users
  const sortedUsers = [...users].sort((a, b) => {
    // Users with unread messages first
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1;

    // Both have unread - sort by most recent
    if (a.unreadCount > 0 && b.unreadCount > 0) {
      if (a.lastChatTime && b.lastChatTime) {
        return b.lastChatTime.getTime() - a.lastChatTime.getTime();
      }
    }

    // Both have chat history - sort by most recent
    if (a.lastChatTime && b.lastChatTime) {
      return b.lastChatTime.getTime() - a.lastChatTime.getTime();
    }
    if (a.lastChatTime && !b.lastChatTime) return -1;
    if (!a.lastChatTime && b.lastChatTime) return 1;

    // No chat history - sort by online status
    if (a.status === 'online' && b.status !== 'online') return -1;
    if (a.status !== 'online' && b.status === 'online') return 1;

    return a.name.localeCompare(b.name);
  });

  const onlineCount = users.filter((u) => u.status === 'online').length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-white dark:bg-slate-950">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">⚠️</span>
          </div>
          <h3 className="text-base font-medium text-slate-900 dark:text-white mb-1">Unable to load users</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <UsersIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Users</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {onlineCount} online • {users.length} total
            </p>
          </div>
        </div>

        {/* Users List */}
        {sortedUsers.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">No other users yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              Invite your friends to join!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedUsers.map((userData) => (
              <UserCard
                key={userData.uid}
                name={userData.name}
                photoURL={userData.photoURL}
                status={userData.status}
                customStatus={userData.customStatus}
                lastMessageTime={userData.lastChatTime}
                lastMessageByMe={userData.lastMessageByMe}
                unreadCount={userData.unreadCount}
                onClick={() => handleOpenChat(userData.uid)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsOnline;
