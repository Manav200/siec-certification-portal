"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigured } from "@/lib/firebase";

// Parse allowed admin emails from environment variables
const getAdminEmails = (): string[] => {
  const envList = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  const list = envList
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // Default fallback admin emails for development & testing
  if (list.length === 0) {
    return ["admin@siec.edu", "admin@example.com"];
  }
  return list;
};

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  isFirebaseConfigured: boolean;
  signInWithEmailAction: (email: string, pass: string) => Promise<void>;
  signUpWithEmailAction: (email: string, pass: string) => Promise<void>;
  signInWithGoogleAction: () => Promise<void>;
  resetPasswordAction: (email: string) => Promise<void>;
  logoutAction: () => Promise<void>;
  loginAsDemoAdminAction: () => void;
  clearErrorAction: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage key for mock demo admin state when testing locally without Firebase keys
const DEMO_ADMIN_KEY = "siec_demo_admin_active";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check admin authorization based on email and Firestore
  const checkIsAdmin = async (currentUser: User | null): Promise<boolean> => {
    if (!currentUser || !currentUser.email) return false;

    const email = currentUser.email.toLowerCase();
    const adminEmails = getAdminEmails();

    // 1. Check environment variable admin whitelist
    if (adminEmails.includes(email)) {
      return true;
    }

    // 2. Check Firestore "users/{uid}" role document if Firestore is active
    if (db) {
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists() && userSnap.data()?.role === "admin") {
          return true;
        }
      } catch (err) {
        console.warn("Could not check Firestore user role:", err);
      }
    }

    return false;
  };

  useEffect(() => {
    // If Firebase is configured with real credentials, listen to auth state changes
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          const adminStatus = await checkIsAdmin(currentUser);
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Fallback: Check if local demo admin session is active
      if (typeof window !== "undefined") {
        const isDemo = localStorage.getItem(DEMO_ADMIN_KEY) === "true";
        if (isDemo) {
          const mockUser = {
            uid: "demo-admin-uid",
            email: "admin@siec.edu",
            displayName: "SIEC Lead Admin",
            photoURL: null,
            emailVerified: true,
          } as unknown as User;
          setUser(mockUser);
          setIsAdmin(true);
        }
      }
      setLoading(false);
    }
  }, []);

  // 1. Sign In with Email & Password
  const signInWithEmailAction = async (email: string, pass: string) => {
    setError(null);
    if (!isFirebaseConfigured || !auth) {
      // If Firebase not configured yet, allow demo admin login
      if (email.toLowerCase().includes("admin")) {
        loginAsDemoAdminAction();
        return;
      }
      throw new Error(
        "Firebase is not configured with API credentials yet. Please add your credentials in .env.local or use Demo Admin Sign-In."
      );
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const adminStatus = await checkIsAdmin(cred.user);
      setIsAdmin(adminStatus);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(formatAuthError(msg));
      throw err;
    }
  };

  // 2. Sign Up with Email & Password
  const signUpWithEmailAction = async (email: string, pass: string) => {
    setError(null);
    if (!isFirebaseConfigured || !auth) {
      throw new Error(
        "Firebase credentials needed in .env.local to create accounts."
      );
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const adminStatus = await checkIsAdmin(cred.user);
      setIsAdmin(adminStatus);

      // Save user record in Firestore if available
      if (db) {
        try {
          await setDoc(
            doc(db, "users", cred.user.uid),
            {
              email: cred.user.email,
              createdAt: new Date().toISOString(),
              role: adminStatus ? "admin" : "member",
            },
            { merge: true }
          );
        } catch (dbErr) {
          console.warn("Could not save user profile to Firestore:", dbErr);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(formatAuthError(msg));
      throw err;
    }
  };

  // 3. Sign In with Google Popup
  const signInWithGoogleAction = async () => {
    setError(null);
    if (!isFirebaseConfigured || !auth) {
      loginAsDemoAdminAction();
      return;
    }

    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const adminStatus = await checkIsAdmin(cred.user);
      setIsAdmin(adminStatus);

      if (db) {
        try {
          await setDoc(
            doc(db, "users", cred.user.uid),
            {
              email: cred.user.email,
              displayName: cred.user.displayName,
              photoURL: cred.user.photoURL,
              lastLogin: new Date().toISOString(),
              role: adminStatus ? "admin" : "member",
            },
            { merge: true }
          );
        } catch (dbErr) {
          console.warn("Could not sync Google user profile to Firestore:", dbErr);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(formatAuthError(msg));
      throw err;
    }
  };

  // 4. Send Password Reset Email
  const resetPasswordAction = async (email: string) => {
    setError(null);
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase credentials needed to send password reset emails.");
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(formatAuthError(msg));
      throw err;
    }
  };

  // 5. Sign Out
  const logoutAction = async () => {
    setError(null);
    if (auth && isFirebaseConfigured) {
      await signOut(auth);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(DEMO_ADMIN_KEY);
    }
    setUser(null);
    setIsAdmin(false);
  };

  // 6. Demo Admin Login (for local development before adding Firebase keys)
  const loginAsDemoAdminAction = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(DEMO_ADMIN_KEY, "true");
    }
    const mockUser = {
      uid: "demo-admin-uid",
      email: "admin@siec.edu",
      displayName: "SIEC Demo Admin",
      photoURL: null,
      emailVerified: true,
    } as unknown as User;
    setUser(mockUser);
    setIsAdmin(true);
    setError(null);
  };

  const clearErrorAction = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        error,
        isFirebaseConfigured,
        signInWithEmailAction,
        signUpWithEmailAction,
        signInWithGoogleAction,
        resetPasswordAction,
        logoutAction,
        loginAsDemoAdminAction,
        clearErrorAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// User-friendly messages for Firebase Auth error codes
function formatAuthError(errorMsg: string): string {
  if (errorMsg.includes("auth/operation-not-allowed")) {
    return "Email/Password sign-in is disabled in your Firebase Console. Go to Firebase Console > Authentication > Sign-in method and enable 'Email/Password'.";
  }
  if (errorMsg.includes("auth/api-key-not-valid") || errorMsg.includes("auth/invalid-api-key")) {
    return "Firebase API key is invalid or not yet active. Please verify your API key in .env.local and restart your dev server.";
  }
  if (errorMsg.includes("auth/unauthorized-domain")) {
    return "Domain (localhost) is not authorized in Firebase. Go to Firebase Console > Authentication > Settings > Authorized domains and ensure 'localhost' is listed.";
  }
  if (errorMsg.includes("auth/network-request-failed")) {
    return "Network request failed. Please check your internet connection and Firebase Console configuration.";
  }
  if (errorMsg.includes("auth/invalid-credential") || errorMsg.includes("auth/wrong-password")) {
    return "Invalid email or password. Please check your credentials and try again.";
  }
  if (errorMsg.includes("auth/user-not-found")) {
    return "No account found with this email address.";
  }
  if (errorMsg.includes("auth/email-already-in-use")) {
    return "An account with this email already exists. Please switch to the 'Sign In' tab.";
  }
  if (errorMsg.includes("auth/weak-password")) {
    return "Password is too weak. Please use at least 6 characters.";
  }
  if (errorMsg.includes("auth/invalid-email")) {
    return "Please provide a valid email address.";
  }
  if (errorMsg.includes("auth/popup-closed-by-user")) {
    return "Google sign-in popup was closed before completing.";
  }
  return errorMsg.replace(/^Firebase:\s*/, "");
}
