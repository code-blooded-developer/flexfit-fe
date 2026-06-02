import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "motion/react";

interface AnimatedCounterProps {
  value: number;
  className?: string;
  suffix?: string;
}

export default function AnimatedCounter({
  value,
  className = "",
  suffix = "",
}: AnimatedCounterProps) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 100, damping: 20 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => {
      setDisplay(Math.round(v).toString());
    });
    return unsubscribe;
  }, [spring]);

  return (
    <motion.span className={className}>
      {display}
      {suffix}
    </motion.span>
  );
}
