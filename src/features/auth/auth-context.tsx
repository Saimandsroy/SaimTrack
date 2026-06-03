
"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  deleteUser,
  type User,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  expelUnauthorizedUser: () => Promise<void>;
};


const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function requireAuth() {
  if (!auth) {
    throw new Error("Firebase is not configured. Add your values to .env.local.");
  }

  return auth;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth) {
      return;
    }

    return onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const approvedEmailsStr = process.env.NEXT_PUBLIC_APPROVED_EMAILS || "";
        const userEmail = currentUser.email ? currentUser.email.toLowerCase() : "";
        if (approvedEmailsStr) {
          const approvedEmails = approvedEmailsStr.split(",").map(e => e.trim().toLowerCase());
          if (!approvedEmails.includes(userEmail)) {
            try {
              await deleteUser(currentUser);
            } catch (e) {
              await signOut(requireAuth());
            }
            if (typeof document !== "undefined") {
              document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax";
            }
            setUser(null);
            setLoading(false);
            return;
          }
        }

        const token = await currentUser.getIdToken();
        if (typeof document !== "undefined") {
          document.cookie = `auth-token=${token}; path=/; max-age=1209600; secure; samesite=lax`;
        }
        setUser(currentUser);
      } else {
        if (typeof document !== "undefined") {
          document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax";
        }
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const approvedEmailsStr = process.env.NEXT_PUBLIC_APPROVED_EMAILS || "";
    if (approvedEmailsStr) {
      const approvedEmails = approvedEmailsStr.split(",").map(e => e.trim().toLowerCase());
      if (!approvedEmails.includes(email.toLowerCase())) {
        throw new Error("Unauthorized: Your email is not approved to access this project.");
      }
    }
    await signInWithEmailAndPassword(requireAuth(), email, password);
  }, []);

  const signUpWithEmail = useCallback(
    async (name: string, email: string, password: string) => {
      const approvedEmailsStr = process.env.NEXT_PUBLIC_APPROVED_EMAILS || "";
      if (approvedEmailsStr) {
        const approvedEmails = approvedEmailsStr.split(",").map(e => e.trim().toLowerCase());
        if (!approvedEmails.includes(email.toLowerCase())) {
          throw new Error("Unauthorized: Your email is not approved to access this project.");
        }
      }
      const credential = await createUserWithEmailAndPassword(
        requireAuth(),
        email,
        password,
      );
      await updateProfile(credential.user, { displayName: name });
      setUser(credential.user);
    },
    [],
  );

  const signInWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(requireAuth(), googleProvider);
    const userEmail = result.user.email ? result.user.email.toLowerCase() : "";
    const approvedEmailsStr = process.env.NEXT_PUBLIC_APPROVED_EMAILS || "";
    
    if (approvedEmailsStr) {
      const approvedEmails = approvedEmailsStr.split(",").map(e => e.trim().toLowerCase());
      if (!approvedEmails.includes(userEmail)) {
        try {
          await deleteUser(result.user);
        } catch (e) {
          await signOut(requireAuth());
        }
        if (typeof document !== "undefined") {
          document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax";
        }
        throw new Error("Unauthorized: Your email is not approved to access this project.");
      }
    }
  }, []);

  const signOutUser = useCallback(async () => {
    if (typeof document !== "undefined") {
      document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax";
    }
    await signOut(requireAuth());
  }, []);

  const expelUnauthorizedUser = useCallback(async () => {
    if (typeof document !== "undefined") {
      document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax";
    }
    const authInstance = requireAuth();
    if (authInstance.currentUser) {
      try {
        await deleteUser(authInstance.currentUser);
      } catch (e) {
        await signOut(authInstance);
      }
    } else {
      await signOut(authInstance);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isConfigured: isFirebaseConfigured,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOutUser,
      expelUnauthorizedUser,
    }),
    [loading, signInWithEmail, signInWithGoogle, signOutUser, expelUnauthorizedUser, signUpWithEmail, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
