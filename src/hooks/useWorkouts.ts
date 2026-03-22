import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  addDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase';
import { SavedWorkout } from '../data';
import { User } from 'firebase/auth';

export const useWorkouts = (user: User | null) => {
  const [history, setHistory] = useState<SavedWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Optimization: load only last 30 days of workouts by default
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const q = query(
      collection(db, 'workouts'),
      where('userId', '==', user.uid),
      where('date', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedWorkout));
      setHistory(logs);
      setLoading(false);
      
      // Cache history for faster subsequent loads
      try {
        localStorage.setItem('workout_history_cache', JSON.stringify(logs));
      } catch (e) {
        console.warn("Failed to cache history:", e);
      }
    }, (error) => {
      console.error("Firestore error:", error);
      // Fallback to simple query if index is not ready
      const fallbackQ = query(
        collection(db, 'workouts'),
        where('userId', '==', user.uid)
      );
      onSnapshot(fallbackQ, (snapshot) => {
        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedWorkout));
        setHistory(logs.sort((a, b) => b.date.toMillis() - a.date.toMillis()));
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, [user]);

  const saveWorkout = async (workout: any) => {
    try {
      const docRef = await addDoc(collection(db, 'workouts'), workout);
      return docRef.id;
    } catch (err) {
      console.error("Error saving workout:", err);
      throw err;
    }
  };

  const deleteWorkout = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'workouts', id));
    } catch (err) {
      console.error("Error deleting workout:", err);
      throw err;
    }
  };

  const bulkImportWorkouts = async (workouts: any[]) => {
    try {
      const promises = workouts.map(w => addDoc(collection(db, 'workouts'), w));
      await Promise.all(promises);
    } catch (err) {
      console.error("Error bulk importing workouts:", err);
      throw err;
    }
  };

  return { history, loading, saveWorkout, deleteWorkout, bulkImportWorkouts };
};
