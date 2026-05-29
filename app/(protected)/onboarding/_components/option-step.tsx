"use client";

import { type ReactNode } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

import type { LucideIcon } from "lucide-react";

type Option = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  emoji?: string;
  description?: string;
};

type Props = {
  title: string;
  subtitle: string;
  options: Option[];
  selectedValue: string | number | null;
  onSelect: (value: string | number) => void;
  getBadge?: (value: string | number) => ReactNode;
};

export function OptionStep({
  title,
  subtitle,
  options,
  selectedValue,
  onSelect,
  getBadge,
}: Props) {
  return (
    <>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold font-display text-foreground mb-1"
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground text-sm mb-8"
      >
        {subtitle}
      </motion.p>

      <div className="flex flex-col gap-3">
        {options.map((option, index) => {
          const isSelected = selectedValue === option.value;

          return (
            <motion.button
              key={option.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(option.value)}
              className={`flex items-center gap-4 w-full p-5 rounded-2xl text-left transition-all ${
                isSelected
                  ? "bg-primary/15 border-2 border-primary"
                  : "bg-card border-2 border-transparent"
              }`}
            >
              {option.icon && (
                <motion.div
                  animate={
                    isSelected
                      ? {
                          rotate: [0, -10, 10, 0],
                          scale: [1, 1.15, 1],
                        }
                      : {}
                  }
                  transition={{ duration: 0.35 }}
                >
                  <option.icon
                    size={24}
                    className={
                      isSelected ? "text-primary" : "text-muted-foreground"
                    }
                  />
                </motion.div>
              )}

              {option.emoji && (
                <motion.span
                  className="text-2xl"
                  animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                >
                  {option.emoji}
                </motion.span>
              )}

              <div>
                <p
                  className={`font-semibold text-base ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {option.label}

                  {getBadge?.(option.value) && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/20 text-primary ml-2 align-middle">
                      {getBadge(option.value)}
                    </span>
                  )}
                </p>

                {option.description && (
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {option.description}
                  </p>
                )}
              </div>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto"
                >
                  <Sparkles size={16} className="text-primary" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </>
  );
}
