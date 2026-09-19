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
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { ADMIN_AUTH_CONFIG } from "@/config/auth";
import type { UserRole, UserProfile } from "@/types";

const AUTHORIZED_ADMINS_STORAGE_KEY = "siec_authorized_admins_list";

// 1. Parse initial admin emails from environment variables (.env.local)
const getEnvAdminEmails = (): string[] => {
  const envList =
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    process.env.ADMIN_EMAILS ||
    "";
  const list = envList
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (list.length === 0) {
    return ["admin@siec.edu", "admin@example.com"];
  }
  return list;
};

// 2. Retrieve combined list of admin emails (Environment Whitelist + Dynamically Registered Admins)
const getAllAuthorizedAdminEmails = (): string[] => {
  const envEmails = getEnvAdminEmails();
  if (typeof window === "undefined") return envEmails;

  try {
    const stored = localStorage.getItem(AUTHORIZED_ADMINS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return Array.from(
          new Set([...envEmails, ...parsed.map((e) => String(e).toLowerCase().trim())])
        );
      }
    }
  } catch (e) {
    console.warn("Could not read authorized admins from local storage:", e);
  }
  return envEmails;
};

// 3. Save a newly verified admin email into persistent storage
const persistAuthorizedAdminEmail = (email: string) => {
  if (typeof window === "undefined" || !email) return;

  try {
    const cleanEmail = email.toLowerCase().trim();
    const current = getAllAuthorizedAdminEmails();
    const updated = Array.from(new Set([...current, cleanEmail]));
    localStorage.setItem(AUTHORIZED_ADMINS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Could not persist authorized admin email:", e);
  }
};

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  isFirebaseConfigured: boolean;
  signInWithEmailAction: (email: string, pass: string) => Promise<void>;
  signUpWithEmailAction: (
    email: string,
    pass: string,
    adminKey?: string,
    displayName?: string
  ) => Promise<void>;
  signUpAdminAction: (
    email: string,
    pass: string,
    adminKey: string,
    displayName?: string
  ) => Promise<void>;
  signUpUserAction: (
    email: string,
    pass: string,
    displayName?: string
  ) => Promise<void>;
  signInWithGoogleAction: () => Promise<void>;
  resetPasswordAction: (email: string) => Promise<void>;
  logoutAction: () => Promise<void>;
  clearErrorAction: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Reads or creates a persistent user profile in Firestore and local registry.
   * Ensures that once an admin registers with the authorized passcode, they are
   * permanently remembered across all logins and sessions.
   */
  const fetchOrCreateUserRole = async (
    currentUser: User,
    desiredRole?: UserRole
  ): Promise<UserRole> => {
    if (!currentUser || !currentUser.email) return "user";

    const email = currentUser.email.toLowerCase().trim();
    const isKnownAdmin = getAllAuthorizedAdminEmails().includes(email);

    // If already registered or requested as Admin, persist email immediately
    if (desiredRole === "admin" || isKnownAdmin) {
      persistAuthorizedAdminEmail(email);
    }

    // 1. Check Cloud Firestore if available
    if (db) {
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const profile = userSnap.data() as Partial<UserProfile>;
          if (profile.role === "admin") {
            persistAuthorizedAdminEmail(email);
            return "admin";
          }
          if (profile.role === "user") {
            // Upgrade if registered as admin or found in authorized registry
            if (desiredRole === "admin" || isKnownAdmin) {
              await setDoc(
                userDocRef,
                { role: "admin", lastLoginAt: new Date().toISOString() },
                { merge: true }
              );
              persistAuthorizedAdminEmail(email);
              return "admin";
            }
            return "user";
          }
        }

        // Document does not exist yet: create it with designated role
        const roleToAssign: UserRole =
          desiredRole === "admin" || isKnownAdmin ? "admin" : "user";

        await setDoc(
          userDocRef,
          {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName:
              currentUser.displayName || email.split("@")[0] || "User",
            photoURL: currentUser.photoURL || null,
            role: roleToAssign,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          },
          { merge: true }
        );

        if (roleToAssign === "admin") {
          persistAuthorizedAdminEmail(email);
        }

        return roleToAssign;
      } catch (dbErr) {
        console.warn("Firestore user profile sync warning (falling back to registry):", dbErr);
      }
    }

    // 2. Reliable Fallback when Firestore is offline or still initializing
    if (desiredRole === "admin" || isKnownAdmin) {
      persistAuthorizedAdminEmail(email);
      return "admin";
    }

    return "user";
  };

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const role = await fetchOrCreateUserRole(currentUser);
        setUserRole(role);
        setIsAdmin(role === "admin");
      } else {
        setUser(null);
        setUserRole(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. Sign In with Email & Password
  const signInWithEmailAction = async (email: string, pass: string) => {
    setError(null);
    if (!isFirebaseConfigured || !auth) {
      throw new Error(
        "Firebase credentials are required. Please configure your .env.local file."
      );
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const role = await fetchOrCreateUserRole(cred.user);
      setUser(cred.user);
      setUserRole(role);
      setIsAdmin(role === "admin");

      if (db) {
        try {
          await setDoc(
            doc(db, "users", cred.user.uid),
            { lastLoginAt: new Date().toISOString() },
            { merge: true }
          );
        } catch {
          // Non-blocking
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(formatAuthError(msg));
      throw err;
    }
  };

  // 2. Admin Self-Registration (Requires Admin Security Passcode)
  const signUpAdminAction = async (
    email: string,
    pass: string,
    adminKey: string,
    displayName?: string
  ) => {
    setError(null);
    if (!isFirebaseConfigured || !auth) {
      throw new Error(
        "Firebase credentials are required. Please configure your .env.local file."
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanKey = adminKey.trim();
    const expectedKey = ADMIN_AUTH_CONFIG.getAdminRegistrationKey();
    const isWhitelisted = getAllAuthorizedAdminEmails().includes(cleanEmail);

    // Validate Admin Passcode: Must match or email must be whitelisted
    if (cleanKey !== expectedKey && !isWhitelisted) {
      const errorMsg =
        "Invalid Admin Passcode. To register an Administrator account, you must provide the authorized Admin Security Passcode.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);

      if (displayName?.trim()) {
        try {
          await updateProfile(cred.user, { displayName: displayName.trim() });
        } catch {
          // Non-blocking
        }
      }

      // Permanently record in local authorized admins registry
      persistAuthorizedAdminEmail(cleanEmail);

      // Explicitly store role as "admin" in Firestore
      const role = await fetchOrCreateUserRole(cred.user, "admin");
      setUser(cred.user);
      setUserRole(role);
      setIsAdmin(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(formatAuthError(msg));
      throw err;
    }
  };

  // 3. Standard User Registration (Role: user)
  const signUpUserAction = async (
    email: string,
    pass: string,
    displayName?: string
  ) => {
    setError(null);
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase credentials are required.");
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);

      if (displayName?.trim()) {
        try {
          await updateProfile(cred.user, { displayName: displayName.trim() });
        } catch {
          // Non-blocking
        }
      }

      const role = await fetchOrCreateUserRole(cred.user, "user");
      setUser(cred.user);
      setUserRole(role);
      setIsAdmin(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(formatAuthError(msg));
      throw err;
    }
  };

  // 4. Combined Sign-Up Action (backward-compatible)
  const signUpWithEmailAction = async (
    email: string,
    pass: string,
    adminKey?: string,
    displayName?: string
  ) => {
    if (adminKey && adminKey.trim()) {
      await signUpAdminAction(email, pass, adminKey, displayName);
    } else {
      const isKnownAdmin = getAllAuthorizedAdminEmails().includes(
        email.trim().toLowerCase()
      );
      if (isKnownAdmin) {
        await signUpAdminAction(
          email,
          pass,
          ADMIN_AUTH_CONFIG.getAdminRegistrationKey(),
          displayName
        );
      } else {
        await signUpUserAction(email, pass, displayName);
      }
    }
  };

  // 5. Sign In with Google Popup
  const signInWithGoogleAction = async () => {
    setError(null);
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase credentials are required.");
    }

    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const role = await fetchOrCreateUserRole(cred.user);
      setUser(cred.user);
      setUserRole(role);
      setIsAdmin(role === "admin");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(formatAuthError(msg));
      throw err;
    }
  };

  // 6. Send Password Reset Email
  const resetPasswordAction = async (email: string) => {
    setError(null);
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase credentials are required.");
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(formatAuthError(msg));
      throw err;
    }
  };

  // 7. Sign Out
  const logoutAction = async () => {
    setError(null);
    if (auth && isFirebaseConfigured) {
      await signOut(auth);
    }
    setUser(null);
    setUserRole(null);
    setIsAdmin(false);
  };

  const clearErrorAction = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isAdmin,
        loading,
        error,
        isFirebaseConfigured,
        signInWithEmailAction,
        signUpWithEmailAction,
        signUpAdminAction,
        signUpUserAction,
        signInWithGoogleAction,
        resetPasswordAction,
        logoutAction,
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
  if (
    errorMsg.includes("auth/api-key-not-valid") ||
    errorMsg.includes("auth/invalid-api-key")
  ) {
    return "Firebase API key is invalid or not yet active. Please check your credentials in .env.local.";
  }
  if (errorMsg.includes("auth/unauthorized-domain")) {
    return "Domain is not authorized in Firebase Console. Go to Authentication > Settings > Authorized domains and add this domain.";
  }
  if (errorMsg.includes("auth/network-request-failed")) {
    return "Network request failed. Please check your internet connection.";
  }
  if (
    errorMsg.includes("auth/invalid-credential") ||
    errorMsg.includes("auth/wrong-password")
  ) {
    return "Invalid email or password. Please verify your credentials.";
  }
  if (errorMsg.includes("auth/user-not-found")) {
    return "No account exists with this email address.";
  }
  if (errorMsg.includes("auth/email-already-in-use")) {
    return "An account with this email already exists. Please switch to the 'Sign In' tab.";
  }
  if (errorMsg.includes("auth/weak-password")) {
    return "Password is too weak. Please use at least 6 characters.";
  }
  if (errorMsg.includes("auth/invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (errorMsg.includes("auth/popup-closed-by-user")) {
    return "Google sign-in popup was closed before completing.";
  }
  return errorMsg.replace(/^Firebase:\s*/, "");
}
