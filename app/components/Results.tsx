import React from 'react';
import { motion } from 'framer-motion';

interface ResultsProps {
  goodWords: Array<{ word: string; ipa: string }>;
  improveWords: Array<{ word: string; ipa: string }>;
  spokenText: string;
  ipa: string;
  tips: string[] | string;
}

export function Results({ goodWords, improveWords, spokenText, ipa, tips }: ResultsProps) {
  // Convert tips to array if it's a string
  const tipsArray = Array.isArray(tips) ? tips : [tips];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-6 border-4 border-black transform hover:scale-[1.01] transition-transform"
      >
        <h2 className="text-2xl font-black mb-4 text-black uppercase border-b-4 border-black pb-2">
          Target IPA
        </h2>
        <p className="text-xl font-mono text-black mb-4">{ipa}</p>
        
        <h2 className="text-2xl font-black mb-4 text-black uppercase border-b-4 border-black pb-2">
          Well Pronounced
        </h2>
        <ul className="space-y-2">
          {goodWords.map((item, index) => (
            <motion.li 
              key={`good-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-xl font-bold text-black"
            >
              <span className="mr-2">→</span>
              <span>{item.word}</span>
              <span className="ml-2 font-mono text-gray-600">/{item.ipa}/</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-6 border-4 border-black transform hover:scale-[1.01] transition-transform"
      >
        <h2 className="text-2xl font-black mb-4 text-black uppercase border-b-4 border-black pb-2">
          Needs Improvement
        </h2>
        <ul className="space-y-2">
          {improveWords.map((item, index) => (
            <motion.li 
              key={`improve-${index}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-xl font-bold text-black"
            >
              <span className="mr-2">×</span>
              <span>{item.word}</span>
              <span className="ml-2 font-mono text-gray-600">/{item.ipa}/</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="md:col-span-2 bg-white p-6 border-4 border-black transform hover:scale-[1.01] transition-transform"
      >
        <h2 className="text-2xl font-black mb-4 text-black uppercase border-b-4 border-black pb-2">
          Improvement Tips
        </h2>
        <ul className="space-y-2">
          {tipsArray.map((tip, index) => (
            <motion.li 
              key={`tip-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-xl text-black"
            >
              • {tip}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
} 