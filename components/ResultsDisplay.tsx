"use client"

import { useState, useEffect } from "react"

type Word = {
  word: string
  confidence: number
}

export default function ResultsDisplay() {
  const [results, setResults] = useState<Word[]>([])

  // In a real application, you would update this state based on the analysis results
  useEffect(() => {
    // Simulated results for demonstration
    setResults([
      { word: "Hello", confidence: 0.95 },
      { word: "World", confidence: 0.85 },
      { word: "Pronunciation", confidence: 0.75 },
      { word: "Analysis", confidence: 0.9 },
    ])
  }, [])

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Analysis Results</h2>
      <div className="space-y-2">
        <h3 className="text-xl font-medium">Well Pronounced Words:</h3>
        <ul className="list-disc list-inside">
          {results
            .filter((word) => word.confidence > 0.8)
            .map((word, index) => (
              <li key={index} className="text-green-600">
                {word.word}
              </li>
            ))}
        </ul>
      </div>
      <div className="space-y-2 mt-4">
        <h3 className="text-xl font-medium">Words to Improve:</h3>
        <ul className="list-disc list-inside">
          {results
            .filter((word) => word.confidence <= 0.8)
            .map((word, index) => (
              <li key={index} className="text-yellow-600">
                {word.word}
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}

