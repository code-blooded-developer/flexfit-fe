"use client";
import { useState } from "react";
import { motion } from "motion/react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function SignUp() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => router.push("/auth/login")}
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
          width="50"
          height="50"
          className="w-16 h-16 mb-4"
        />
        <h1 className="text-3xl font-bold font-display text-foreground text-center">
          {submitted ? "Check your inbox" : "Forgot password?"}
        </h1>
        <p className="text-muted-foreground text-sm mt-2 text-center max-w-xs">
          {submitted
            ? `We sent a reset link to ${email}`
            : "Enter your email and we'll send you a link to reset your password"}
        </p>
      </motion.div>

      {!submitted ? (
        <motion.form
          onSubmit={handleSubmit}
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
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full py-4 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-base glow-primary-intense mt-2"
          >
            Send Reset Link
          </motion.button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="text-primary font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>
        </motion.form>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="flex flex-col items-center gap-6 max-w-sm mx-auto w-full relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 360] }}
            transition={{ duration: 0.6, type: "spring" }}
            className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center"
          >
            <CheckCircle2 size={40} className="text-primary" />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/auth/login")}
            className="w-full py-4 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-base glow-primary-intense"
          >
            Back to Login
          </motion.button>

          <button
            onClick={() => setSubmitted(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Didn&apos;t receive it? Try again
          </button>
        </motion.div>
      )}
    </>
  );
}
