"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  remaining: number;
}

export function Paywall({ isOpen, onClose, remaining }: PaywallProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full max-w-md border-tarot-gold/30">
              <CardContent className="p-6">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-tarot-light/40 hover:text-tarot-light"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-tarot-purple to-tarot-gold mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>

                  <h2 className="text-2xl font-bold text-tarot-gold mb-2">
                    Upgrade to Unlimited
                  </h2>
                  <p className="text-tarot-light/60 mb-6">
                    You&apos;ve used all 3 free readings. Unlock unlimited AI tarot
                    interpretations!
                  </p>

                  <div className="bg-tarot-dark/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5 text-tarot-gold" />
                      <span className="text-3xl font-bold text-tarot-gold">
                        $4.99
                      </span>
                      <span className="text-tarot-light/60">/month</span>
                    </div>

                    <ul className="space-y-2 text-left">
                      {[
                        "Unlimited AI tarot readings",
                        "All 5 spread types",
                        "Follow-up chat with Oracle",
                        "Save reading history",
                        "Priority support",
                      ].map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-tarot-light/80"
                        >
                          <Check className="w-4 h-4 text-tarot-gold flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    variant="mystical"
                    size="lg"
                    className="w-full"
                    onClick={handleUpgrade}
                    disabled={isLoading}
                  >
                    {isLoading ? "Redirecting to checkout..." : "Upgrade Now"}
                  </Button>

                  <p className="text-xs text-tarot-light/40 mt-4">
                    Cancel anytime. Secure payment via Stripe.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
