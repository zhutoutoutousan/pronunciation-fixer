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
      <motion.p 
        className="text-white text-xl mt-4 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Master your English pronunciation with AI-powered feedback
      </motion.p>
    </motion.div>
  );
} 