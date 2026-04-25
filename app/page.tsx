"use client";

import { useEffect } from "react";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";

import Image from "next/image";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/auth");
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-8 relative overflow-hidden">
      {/* Animated background rings */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border border-primary/10"
          style={{
            width: ring * 200,
            height: ring * 200,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.1, 0.3, 0.1] }}
          transition={{
            duration: 4,
            delay: ring * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          duration: 1,
          type: "spring",
          stiffness: 120,
          damping: 12,
        }}
        className="mb-8 relative"
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, hsl(142 71% 45% / 0.2) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <Image
          loading="eager"
          src="/logos/flexfit-logo.png"
          alt="FlexFit"
          width="120"
          height="120"
          className="relative z-10"
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.7, type: "spring" }}
        className="text-4xl font-bold font-display text-gradient-primary mb-3"
      >
        FlexFit
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.3em" }}
        animate={{ opacity: 1, letterSpacing: "0.2em" }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="text-muted-foreground text-sm uppercase"
      >
        Train Smarter. Get Stronger.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3, type: "spring" }}
        className="mt-16"
      >
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </motion.div>
    </div>
  );
}
