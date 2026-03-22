import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, handleRedirectResult } from '../firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // Handle redirect result for PWAs
        const result = await handleRedirectResult();
        if (result?.user) {
          if (isMounted) {
            setUser(result.user);
            setAuthLoading(false);
          }
          return;
        }
      } catch (err: any) {
        console.error("Redirect Error:", err);
      }

      // Then listen for auth state changes
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        if (isMounted) {
          setUser(u);
          // Reduced delay for faster perceived loading
          setTimeout(() => {
            if (isMounted) setAuthLoading(false);
          }, 100);
        }
      });

      return unsubscribe;
    };

    const unsubPromise = initAuth();

    return () => {
      isMounted = false;
      unsubPromise.then(unsub => unsub && unsub());
    };
  }, []);

  return { user, authLoading, setUser, setAuthLoading };
};
