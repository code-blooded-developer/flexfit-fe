import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Check, X, Share2, ChevronDown, Plus } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "flexfit_install_dismissed_at";
const DISMISS_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days

const InstallAppCard = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [visible, setVisible] = useState(false);
  const [showIOSFallback, setShowIOSFallback] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_DURATION) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS
      window.navigator.standalone === true;
    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferred(event);
      deferredRef.current = event;
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installed = () => setVisible(false);
    window.addEventListener("appinstalled", installed);

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const fallbackTimer = setTimeout(() => {
      if (!deferredRef.current && iOS) setShowIOSFallback(true);
    }, 8000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
    }
    setDeferred(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {(visible || showIOSFallback) && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mx-6 mt-6 relative z-10"
        >
          <div className="rounded-3xl bg-card p-6 border border-border relative overflow-hidden">
            <motion.div
              className="absolute -top-12 -right-12 w-36 h-36 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, hsl(142 71% 45% / 0.12) 0%, transparent 70%)",
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <button
              onClick={handleDismiss}
              aria-label="Dismiss"
              className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-1 relative z-10">
              <Download size={14} className="text-primary" />
              <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                Get the App
              </span>
            </div>
            <h2 className="text-2xl font-bold font-display text-foreground mt-2 relative z-10">
              Install FlexFit
            </h2>

            <ul className="mt-4 space-y-2 relative z-10">
              {[
                "Faster loading",
                "Home screen access",
                "Full-screen experience",
              ].map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Check size={14} className="text-primary shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            {showIOSFallback && showInstructions ? (
              <div className="mt-6 space-y-3 relative z-10">
                <p className="text-sm font-semibold text-foreground mb-3">
                  Add FlexFit to your home screen:
                </p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <Share2 size={14} className="text-primary" />
                  </div>
                  <span>Tap the <strong>Share</strong> button in your browser</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <ChevronDown size={14} className="text-primary" />
                  </div>
                  <span>Scroll down & tap <strong>Add to Home Screen</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <Plus size={14} className="text-primary" />
                  </div>
                  <span>Tap <strong>Add</strong> in the top right</span>
                </div>
                <motion.button
                  onClick={handleDismiss}
                  whileTap={{ scale: 0.97 }}
                  className="w-full mt-4 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm glow-primary-intense"
                >
                  Got it
                </motion.button>
              </div>
            ) : (
              <div className="flex gap-3 mt-6 relative z-10">
                <motion.button
                  onClick={deferred ? handleInstall : () => setShowInstructions(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm glow-primary-intense"
                >
                  {deferred ? "Install" : "How to Install"}
                </motion.button>
                <motion.button
                  onClick={handleDismiss}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-3 rounded-2xl bg-muted text-muted-foreground font-semibold text-sm"
                >
                  Maybe Later
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallAppCard;
