"use client";

import { motion } from "motion/react";

import Image from "next/image";

export default function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-8 relative overflow-hidden">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          duration: 1,
          type: "spring",
          stiffness: 120,
          damping: 12,
        }}
        className="mb-8 relative flex items-center justify-center rounded-full overflow-visible"
        style={{ width: 240, height: 240 }}
      >
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 250,
            height: 250,
            top: -10,
            left: -10,
            background:
              "radial-gradient(circle at center, hsl(142 71% 45% / 0.5) 0%, hsl(142 71% 45% / 0.25) 40%, hsl(142 71% 45% / 0.1) 60%, transparent 75%)",
          }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
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
        <div
          style={{
            width: "24px",
            height: "24px",
            border: "5px solid hsl(142, 71%, 45%)",
            borderTop: "5px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </motion.div>
    </div>
  );
}
