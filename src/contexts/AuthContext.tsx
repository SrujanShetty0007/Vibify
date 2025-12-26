import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  status: 'online' | 'offline';
  customStatus: string;
  lastSeen: Date;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createOrUpdateUserDoc = async (user: User, additionalData?: Partial<UserProfile>) => {
    try {
      const userRef = doc(db, 'users', user.uid);

      console.log('Fetching user document for:', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.log('Creating new user document...');
        await setDoc(userRef, {
          uid: user.uid,
          name: additionalData?.name || user.displayName || 'Anonymous',
          email: user.email,
          photoURL: user.photoURL || '',
          status: 'online',
          customStatus: '',
          lastSeen: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
        console.log('User document created successfully');
      } else {
        console.log('Updating existing user document...');
        await updateDoc(userRef, {
          status: 'online',
          lastSeen: serverTimestamp(),
        });
        console.log('User document updated successfully');
      }

      const updatedSnap = await getDoc(userRef);
      if (updatedSnap.exists()) {
        const data = updatedSnap.data();
        const profile = {
          ...data,
          lastSeen: data.lastSeen?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
        } as UserProfile;
        console.log('User profile loaded:', profile);
        setUserProfile(profile);
      }
    } catch (error: any) {
      console.error('Error creating/updating user doc:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setError(error.message);

      // Set a basic profile even if Firestore fails
      const fallbackProfile = {
        uid: user.uid,
        name: additionalData?.name || user.displayName || 'Anonymous',
        email: user.email || '',
        photoURL: user.photoURL || '',
        status: 'online',
        customStatus: '',
        lastSeen: new Date(),
        createdAt: new Date(),
      };
      console.log('Using fallback profile:', fallbackProfile);
      setUserProfile(fallbackProfile);
    }
  };

  const setUserOffline = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        status: 'offline',
        lastSeen: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error setting user offline:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setUser(user);
      if (user) {
        try {
          await createOrUpdateUserDoc(user);
        } catch (error) {
          console.error('Error in auth state change:', error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        setUserOffline(user.uid);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createOrUpdateUserDoc(result.user, { name });
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    if (user) {
      await setUserOffline(user.uid);
    }
    await signOut(auth);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, data);
    setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  const value = {
    user,
    userProfile,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
