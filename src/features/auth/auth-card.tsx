"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FirebaseError } from "firebase/app";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/auth-context";
import {
  signInSchema,
  signUpSchema,
  type SignInValues,
  type SignUpValues,
} from "@/features/auth/auth-schema";

type AuthMode = "sign-in" | "sign-up";

type AuthCardProps = {
  mode: AuthMode;
};

function getAuthErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    if (error.code === "auth/invalid-credential") {
      return "The email or password is incorrect.";
    }

    if (error.code === "auth/email-already-in-use") {
      return "An account already exists for this email.";
    }

    if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
      return "Google sign-in was closed or cancelled before it finished.";
    }
  }

  if (error instanceof Error) {
    if (
      error.message.includes("auth/popup-closed-by-user") ||
      error.message.includes("auth/cancelled-popup-request")
    ) {
      return "Google sign-in was closed or cancelled before it finished.";
    }
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const {
    isConfigured,
    signInWithEmail,
    signInWithGoogle,
    signUpWithEmail,
  } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const searchParams = useSearchParams();
  const isUnauthorized = searchParams.get("error") === "unauthorized";
  const isSignUp = mode === "sign-up";

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isSubmitting =
    signInForm.formState.isSubmitting || signUpForm.formState.isSubmitting;

  async function handleSignIn(values: SignInValues) {
    try {
      await signInWithEmail(values.email, values.password);
      toast.success("Welcome back.");
      router.replace("/dashboard");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    }
  }

  async function handleSignUp(values: SignUpValues) {
    try {
      await signUpWithEmail(values.name, values.email, values.password);
      toast.success("Your workspace is ready.");
      router.replace("/dashboard");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    }
  }

  async function handleGoogle() {
    try {
      setIsGoogleLoading(true);
      await signInWithGoogle();
      toast.success("Signed in with Google.");
      router.replace("/dashboard");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsGoogleLoading(false);
    }
  }

  async function handleDemo() {
    try {
      setIsDemoLoading(true);
      await signInWithEmail("demo@saimtrack.com", "demo1234");
      toast.success("Welcome to the demo.");
      router.replace("/dashboard");
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err?.code === "auth/invalid-credential" || err?.code === "auth/user-not-found") {
        try {
          await signUpWithEmail("Demo User", "demo@saimtrack.com", "demo1234");
          toast.success("Demo workspace ready.");
          router.replace("/dashboard");
        } catch (signupError) {
          toast.error(getAuthErrorMessage(signupError));
        }
      } else {
        toast.error(getAuthErrorMessage(error));
      }
    } finally {
      setIsDemoLoading(false);
    }
  }

  const disabled = !isConfigured || isSubmitting || isGoogleLoading;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      className="w-full rounded-[1.5rem] bg-[#1F1C1B] border border-[#F5F2EC]/5 p-8 sm:p-10 shadow-2xl"
    >
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[#F5F2EC] uppercase font-oswald">
          {isSignUp ? "Create Account" : "Sign In"}
        </h1>
        <p className="mt-3 text-sm font-medium text-[#F5F2EC]/60">
          {isSignUp
            ? "Enter your details to create your workspace."
            : "Welcome back to your workspace."}
        </p>
      </div>

      {!isConfigured ? (
        <div className="mb-6 rounded-lg border border-[#CBA365]/30 bg-[#CBA365]/10 p-4 text-xs font-medium text-[#CBA365]">
          Firebase is not configured yet. Add credentials to{" "}
          <code>.env.local</code> and restart the dev server.
        </div>
      ) : null}

      {isUnauthorized ? (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-500 text-center">
          You are not eligible for this tool. Your email has not been approved.
        </div>
      ) : null}

      <Button
        className="w-full h-12 bg-[#2A2726] border border-[#F5F2EC]/10 text-[#F5F2EC] hover:bg-[#36312F] hover:border-[#F5F2EC]/20 transition-all rounded-xl flex items-center justify-center gap-3 cursor-pointer font-semibold"
        disabled={disabled}
        type="button"
        onClick={handleGoogle}
      >
        {isGoogleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#F5F2EC]/50" />
        ) : (
          <svg className="h-4 w-4 text-[#F5F2EC]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        Continue with Google
      </Button>

      <Button
        className="w-full h-12 mt-3 bg-transparent border border-accent/30 text-accent hover:bg-accent/10 transition-all rounded-xl flex items-center justify-center gap-3 cursor-pointer font-semibold"
        disabled={disabled || isDemoLoading}
        type="button"
        onClick={handleDemo}
      >
        {isDemoLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        )}
        View Demo Workspace
      </Button>

      <div className="my-8 flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-[#F5F2EC]/40">
        <div className="h-[1px] flex-1 bg-[#F5F2EC]/10" />
        OR
        <div className="h-[1px] flex-1 bg-[#F5F2EC]/10" />
      </div>

      {isSignUp ? (
        <form
          className="space-y-5"
          onSubmit={signUpForm.handleSubmit(handleSignUp)}
        >
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#F5F2EC]/70 text-xs font-semibold uppercase tracking-wider">Name</Label>
            <Input 
              id="name" 
              autoComplete="name" 
              className="bg-[#2A2726] border-none focus:ring-1 focus:ring-[#CBA365]/50 text-[#F5F2EC] placeholder-[#F5F2EC]/20 rounded-xl h-12 px-4"
              {...signUpForm.register("name")} 
            />
            <FormError message={signUpForm.formState.errors.name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#F5F2EC]/70 text-xs font-semibold uppercase tracking-wider">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="bg-[#2A2726] border-none focus:ring-1 focus:ring-[#CBA365]/50 text-[#F5F2EC] placeholder-[#F5F2EC]/20 rounded-xl h-12 px-4"
              {...signUpForm.register("email")}
            />
            <FormError message={signUpForm.formState.errors.email?.message} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#F5F2EC]/70 text-xs font-semibold uppercase tracking-wider">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                className="bg-[#2A2726] border-none focus:ring-1 focus:ring-[#CBA365]/50 text-[#F5F2EC] placeholder-[#F5F2EC]/20 rounded-xl h-12 px-4"
                {...signUpForm.register("password")}
              />
              <FormError message={signUpForm.formState.errors.password?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#F5F2EC]/70 text-xs font-semibold uppercase tracking-wider">Confirm</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="bg-[#2A2726] border-none focus:ring-1 focus:ring-[#CBA365]/50 text-[#F5F2EC] placeholder-[#F5F2EC]/20 rounded-xl h-12 px-4"
                {...signUpForm.register("confirmPassword")}
              />
              <FormError
                message={signUpForm.formState.errors.confirmPassword?.message}
              />
            </div>
          </div>
          <SubmitButton disabled={disabled} loading={isSubmitting}>
            Create Account
          </SubmitButton>
        </form>
      ) : (
        <form
          className="space-y-5"
          onSubmit={signInForm.handleSubmit(handleSignIn)}
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#F5F2EC]/70 text-xs font-semibold uppercase tracking-wider">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="bg-[#2A2726] border-none focus:ring-1 focus:ring-[#CBA365]/50 text-[#F5F2EC] placeholder-[#F5F2EC]/20 rounded-xl h-12 px-4"
              {...signInForm.register("email")}
            />
            <FormError message={signInForm.formState.errors.email?.message} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[#F5F2EC]/70 text-xs font-semibold uppercase tracking-wider">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className="bg-[#2A2726] border-none focus:ring-1 focus:ring-[#CBA365]/50 text-[#F5F2EC] placeholder-[#F5F2EC]/20 rounded-xl h-12 px-4"
              {...signInForm.register("password")}
            />
            <FormError message={signInForm.formState.errors.password?.message} />
          </div>
          <SubmitButton disabled={disabled} loading={isSubmitting}>
            Sign In
          </SubmitButton>
        </form>
      )}

      <div className="mt-8 text-center text-sm font-medium text-text-tertiary">
        {isSignUp ? "Already have an account?" : "New to SaimTrack?"}{" "}
        <Link href={isSignUp ? "/auth/sign-in" : "/auth/sign-up"} className="text-text-primary hover:text-accent transition-colors underline underline-offset-4 decoration-border hover:decoration-accent">
          {isSignUp ? "Sign in" : "Sign up"}
        </Link>
      </div>

    </motion.div>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <motion.p 
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-xs font-medium text-rose-500/80 mt-1"
    >
      {message}
    </motion.p>
  );
}

function SubmitButton({
  children,
  disabled,
  loading,
}: {
  children: string;
  disabled: boolean;
  loading: boolean;
}) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full pt-2">
      <Button 
        className="w-full h-12 bg-[#CBA365] hover:bg-[#DBC191] text-[#1F1C1B] font-bold tracking-wide uppercase text-sm shadow-[0_0_20px_rgba(203,163,101,0.1)] border-none transition-all flex items-center justify-center gap-2 rounded-xl" 
        disabled={disabled} 
        type="submit"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : children}
      </Button>
    </motion.div>
  );
}
