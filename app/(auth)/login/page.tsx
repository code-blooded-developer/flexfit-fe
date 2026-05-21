"use client";
import { useState } from "react";
import { motion } from "motion/react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { ErrorMsg } from "@/components/ErrorMsg";
import { useAuth } from "@/hooks/useAuth";

import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

type Errors = { email?: string; password?: string };

export default function Login() {
  const router = useRouter();
  const { signIn, isLoading, error: apiError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): boolean => {
    const newErrors: Errors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Invalid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    await signIn(email.trim(), password);
  };

  const clearError = (field: keyof Errors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const fieldClass = (hasError: boolean) =>
    `w-full pl-12 pr-4 py-4 rounded-xl bg-secondary border text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
      hasError
        ? "border-destructive focus:border-destructive"
        : "border-border focus:border-primary"
    }`;

  return (
    <>
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => router.push("/auth")}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary text-foreground relative z-10"
        aria-label="Back"
      >
        <ArrowLeft size={20} />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mt-8 mb-10 relative z-10"
      >
        <Image
          src="/logos/flexfit-logo.png"
          alt="FlexFit"
          width={50}
          height={50}
          className="w-16 h-16 mb-4"
        />
        <h1 className="text-3xl font-bold font-display text-foreground">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Log in to continue your journey
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        noValidate
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col gap-4 max-w-sm mx-auto w-full relative z-10"
      >
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            Email
          </label>
          <div className="relative">
            <Mail
              size={18}
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.email ? "text-destructive" : "text-muted-foreground"}`}
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError("email");
              }}
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              className={fieldClass(!!errors.email)}
            />
          </div>
          <ErrorMsg msg={errors.email} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            Password
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError("password");
              }}
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              className={fieldClass(!!errors.password)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <ErrorMsg msg={errors.password} />
        </div>

        <Link
          href="/forgot-password"
          className="text-xs text-primary font-medium self-end px-1 hover:underline"
        >
          Forgot password?
        </Link>

        <ErrorMsg msg={apiError} />

        <motion.button
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.97 }}
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-base glow-primary-intense mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Logging in...
            </>
          ) : (
            "Log In"
          )}
        </motion.button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </motion.form>
    </>
  );
}
