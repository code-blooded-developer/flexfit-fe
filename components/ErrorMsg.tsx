"use client";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle } from "lucide-react";

export const ErrorMsg = ({ msg }: { msg?: string | null }) => (
  <AnimatePresence>
    {msg && (
      <motion.div
        initial={{ opacity: 0, y: -4, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -4, height: 0 }}
        transition={{ duration: 0.18 }}
        className="flex items-center gap-1.5 px-1 text-xs text-destructive mt-1"
      >
        <AlertCircle size={12} />
        <span>{msg}</span>
      </motion.div>
    )}
  </AnimatePresence>
);
