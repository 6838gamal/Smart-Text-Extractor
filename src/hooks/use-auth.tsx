
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type PlanId = 'free' | 'starter' | 'pro' | 'team' | 'business' | 'enterprise' | 'custom';

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  error?: Error;
  plan: PlanId;
  refreshPlan: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  plan: 'free',
  refreshPlan: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, authLoading, error] = useAuthState(auth);
  const [plan, setPlan] = useState<PlanId>('free');
  const [isPlanLoading, setIsPlanLoading] = useState(true);

  const fetchUserPlan = async (currentUser: User | null) => {
    if (currentUser) {
      setIsPlanLoading(true);
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userPlan = userDoc.data()?.plan || 'free';
          setPlan(userPlan);
        } else {
          // This is a new or existing user without a document, create one for them.
          await setDoc(userDocRef, { plan: 'free', email: currentUser.email });
          setPlan('free');
        }
      } catch (e) {
        console.error("Error fetching user plan:", e);
        setPlan('free'); // Fallback to free plan on error
      } finally {
        setIsPlanLoading(false);
      }
    } else {
      // User is not logged in
      setPlan('free');
      setIsPlanLoading(false);
    }
  };

  useEffect(() => {
    // This effect runs on the client and fetches the user's plan from Firestore.
    if (!authLoading) {
      fetchUserPlan(user);
    }
  }, [user, authLoading]);

  const loading = authLoading || isPlanLoading;

  return (
    <AuthContext.Provider
      value={{ user: user as User | null, loading, error, plan, refreshPlan: () => fetchUserPlan(user) }}
    >
      {children}
    </AuthContext.Provider>
  );
}
