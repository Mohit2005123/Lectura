"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedTestimonialsDemo } from "./flashcard_body";

export default function FlashCardModal({ isOpen, onClose, card }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[2px]"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{
              duration: 0.2,
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#1f1f23] text-white rounded-xl shadow-xl w-11/12 max-w-4xl p-8 min-h-[400px]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-300 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold mb-6 text-center">Flashcards</h2>
            {/* Pass the card prop as flashCards */}
            <AnimatedTestimonialsDemo flashCards={card || []} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
