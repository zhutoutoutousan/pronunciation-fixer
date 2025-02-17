import React from 'react';
import { motion } from 'framer-motion';

export function Title() {
  return (
    <motion.div 
      className="text-left"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="bg-white border-4 border-black p-6">
        <h1 className="text-6xl font-black text-black uppercase tracking-tighter leading-none">
          Stellar
        </h1>
        <h1 className="text-6xl font-black text-black uppercase tracking-tighter leading-none mt-2">
          Pronun-
        </h1>
        <h1 className="text-6xl font-black text-black uppercase tracking-tighter leading-none">
          ciation
        </h1>
        <h1 className="text-6xl font-black text-black uppercase tracking-tighter leading-none mt-2">
          Hero
        </h1>
      </div>
      <motion.div 
        className="mt-4 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-white text-xl font-medium">
          Master your English pronunciation with AI-powered feedback
        </p>
        <ul className="text-gray-300 space-y-1">
          <li>✓ 100% Free to Use</li>
          <li>✓ No Sign-up Required</li>
          <li>✓ Instant AI Feedback</li>
          <li>✓ IPA Transcription</li>
          <li>✓ Improvement Tips</li>
        </ul>
      </motion.div>
    </motion.div>
  );
} 