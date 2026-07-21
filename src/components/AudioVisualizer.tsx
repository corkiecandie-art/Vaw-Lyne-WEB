/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  color?: string;
  barCount?: number;
}

export default function AudioVisualizer({
  isPlaying,
  color = 'bg-gold-400',
  barCount = 18
}: AudioVisualizerProps) {
  const [heights, setHeights] = useState<number[]>([]);

  useEffect(() => {
    // Initialize heights
    setHeights(Array.from({ length: barCount }, () => Math.floor(Math.random() * 80) + 15));
  }, [barCount]);

  useEffect(() => {
    if (!isPlaying) {
      // Settle down heights when paused
      const interval = setInterval(() => {
        setHeights((prev) =>
          prev.map((h) => {
            if (h > 10) return h - (h - 6) * 0.15;
            return 6;
          })
        );
      }, 50);
      return () => clearInterval(interval);
    }

    // Dynamic wave updates
    const interval = setInterval(() => {
      setHeights((prev) =>
        prev.map((_, idx) => {
          // Create some cohesive wave movement
          const time = Date.now() * 0.003;
          const factor = Math.sin(time + idx * 0.4) * 30 + 50;
          const noise = Math.random() * 25 - 12.5;
          const result = Math.max(10, Math.min(100, factor + noise));
          return Math.round(result);
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex items-end justify-center gap-1.5 h-16 px-4 w-full" id="audio-visualizer">
      {heights.map((height, idx) => (
        <motion.div
          key={idx}
          className={`w-1 rounded-full ${color}`}
          animate={{ height: `${height}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 25 }}
          style={{
            opacity: isPlaying ? 0.3 + (idx % 3) * 0.25 : 0.25,
            boxShadow: isPlaying ? '0 0 8px rgba(212, 178, 22, 0.5)' : 'none'
          }}
        />
      ))}
    </div>
  );
}
