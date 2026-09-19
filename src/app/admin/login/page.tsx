"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import SiecLogo from "@/components/SiecLogo";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin";

  const {
    user,
    userRole,
    isAdmin,
    loading,
    error,
    isFirebaseConfigured,
    signInWithEmailAction,
    signUpAdminAction,
    signInWithGoogleAction,
    resetPasswordAction,
    clearErrorAction,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminPasscode, setAdminPasscode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Redirect if already authenticated as Admin
  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.push(redirectPath);
    }
  }, [user, isAdmin, loading, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrorAction();
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        await signInWithEmailAction(email, password);
        router.push(redirectPath);
      } else if (mode === "signup") {
        await signUpAdminAction(email, password, adminPasscode, fullName);
        setSuccessMessage(
          "Admin account created and authorized successfully! Redirecting to workspace..."
        );
        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);
      } else if (mode === "reset") {
        await resetPasswordAction(email);
        setSuccessMessage(
          "Password reset link sent! Check your inbox to set a new password."
        );
      }
    } catch {
      // Error handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearErrorAction();
    setSuccessMessage("");
    setIsSubmitting(true);
    try {
      await signInWithGoogleAction();
      router.push(redirectPath);
    } catch {
      // Error handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-cyan-400/15 to-purple-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-10 -z-10 h-72 w-72 rounded-full bg-amber-300/10 blur-2xl" />

      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-primary opacity-30 blur group-hover:opacity-60 transition-opacity" />
              <SiecLogo size={52} className="relative" />
            </div>
          </Link>
          <h1 className="font-display text-2xl font-black tracking-tight text-gray-900 mt-4">
            SIEC Admin Portal
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Production Certificate Generation &amp; Event Management
          </p>

          {/* Connection & Security Status */}
          <div className="mt-3 flex items-center justify-center gap-2">
            {isFirebaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Firebase Auth Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800 border border-amber-200">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Config Needed (.env.local)
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 border border-blue-200">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Role-Protected
            </span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="card border border-white/80 bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-fade-in">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl border border-gray-100 bg-gray-100/80 p-1 mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                clearErrorAction();
                setSuccessMessage("");
              }}
              className={`flex-1 rounded-lg py-2 transition-all duration-200 ${
                mode === "signin"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                clearErrorAction();
                setSuccessMessage("");
              }}
              className={`flex-1 rounded-lg py-2 transition-all duration-200 ${
                mode === "signup"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Register Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("reset");
                clearErrorAction();
                setSuccessMessage("");
              }}
              className={`flex-1 rounded-lg py-2 transition-all duration-200 ${
                mode === "reset"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Reset
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-100 animate-fade-in flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-200 animate-fade-in flex items-start gap-2">
              <span className="text-sm">✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* User Role Notice if signed in as normal user */}
          {user && !isAdmin && userRole === "user" && (
            <div className="mb-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 animate-fade-in">
              <p className="font-bold">Standard User Account Detected</p>
              <p className="text-[11px] mt-0.5">
                Signed in as <span className="font-semibold">{user.email}</span>. To access administrative controls, please sign in with an Administrator account or register with an authorized admin passcode.
              </p>
            </div>
          )}

          {/* 1-Click Google Sign In (for Sign In) */}
          {mode === "signin" && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-2.5 px-4 text-xs font-bold text-gray-800 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-60 cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-white px-2 text-gray-400">Or with Email</span>
                </div>
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name field on Signup */}
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="auth-fullname"
                  className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
                >
                  Admin Full Name
                </label>
                <input
                  id="auth-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Manav Mahawar"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            )}

            {/* Email Address */}
            <div>
              <label
                htmlFor="auth-email"
                className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@siec.edu"
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            {/* Password */}
            {mode !== "reset" && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="auth-password"
                    className="block text-[11px] font-bold uppercase tracking-wider text-gray-700"
                  >
                    Password
                  </label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => setMode("reset")}
                      className="text-[10px] font-bold text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 pr-10 text-xs text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            )}

            {/* Admin Security Passcode field (Only for Register Admin mode) */}
            {mode === "signup" && (
              <div className="rounded-xl bg-blue-50/60 p-3.5 border border-blue-100">
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="auth-admin-passcode"
                    className="block text-[11px] font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1.5"
                  >
                    <span>🛡️</span>
                    <span>Admin Security Passcode</span>
                  </label>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100/80 px-1.5 py-0.5 rounded">
                    Required
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="auth-admin-passcode"
                    type={showPasscode ? "text" : "password"}
                    required
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="Enter admin passcode (default: admin123)"
                    className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 pr-10 text-xs text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    {showPasscode ? "🙈" : "👁️"}
                  </button>
                </div>
                <p className="text-[10px] text-blue-800/80 mt-1.5 leading-relaxed">
                  Protects your public deployment by ensuring only authorized administrators can self-register with full event &amp; certificate control.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-2.5 text-xs font-bold text-center mt-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting
                ? "Processing..."
                : mode === "signin"
                ? "Sign In to Admin Workspace"
                : mode === "signup"
                ? "Register & Authorize Admin Account"
                : "Send Password Reset Link"}
            </button>
          </form>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <Link href="/" className="font-semibold text-primary-600 hover:underline">
            ← Return to Public Certificate Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <p className="text-xs text-gray-400 font-semibold animate-pulse">
            Loading Admin Portal...
          </p>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
