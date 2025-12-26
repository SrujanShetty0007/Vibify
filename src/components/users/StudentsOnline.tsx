import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot } from 'firebase/firestore';
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
}

const StudentsOnline = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleOpenChat = (userId: string) => {
    navigate(`/chat/${userId}`, { state: { from: 'students' } });
  };

  useEffect(() => {
    console.log('Setting up users listener...');

    const q = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('Users snapshot received:', snapshot.docs.length, 'documents');

        const usersData = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            console.log('User data:', doc.id, data);
            return {
              uid: doc.id,
              name: data.name || 'Unknown',
              email: data.email || '',
              photoURL: data.photoURL || '',
              status: data.status || 'offline',
              customStatus: data.customStatus || '',
              lastSeen: data.lastSeen?.toDate() || new Date(),
            };
          })
          .filter((u) => u.uid !== user?.uid);

        usersData.sort((a, b) => {
          if (a.status === 'online' && b.status !== 'online') return -1;
          if (a.status !== 'online' && b.status === 'online') return 1;
          return a.name.localeCompare(b.name);
        });

        console.log('Filtered users:', usersData.length);
        setUsers(usersData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching users:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      console.log('Cleaning up users listener');
      unsubscribe();
    };
  }, [user]);

  const onlineCount = users.filter((u) => u.status === 'online').length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Unable to load users</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Users</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {onlineCount} online • {users.length} total
              </p>
            </div>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
              <UsersIcon className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">No other users yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              Invite your friends to join!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((userData) => (
              <UserCard
                key={userData.uid}
                name={userData.name}
                photoURL={userData.photoURL}
                status={userData.status}
                customStatus={userData.customStatus}
                onClick={() => handleOpenChat(userData.uid)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default StudentsOnline;
