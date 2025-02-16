"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

interface HeatMapProps {
  data: Array<{
    day: string;
    value: number;
    label: string;
  }>;
  maxValue?: number;
  minValue?: number;
  colorScale?: string[];
}

export function HeatMap({ 
  data, 
  maxValue = 100, 
  minValue = 0,
  colorScale = ['#f7fafc', '#4299e1', '#2b6cb0']
}: HeatMapProps) {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  const getColor = (value: number) => {
    const percentage = (value - minValue) / (maxValue - minValue);
    const colorIndex = Math.floor(percentage * (colorScale.length - 1));
    return colorScale[colorIndex];
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {data.map((cell, index) => (
        <motion.div
          key={index}
          className="relative aspect-square rounded-sm cursor-pointer"
          style={{ backgroundColor: getColor(cell.value) }}
          whileHover={{ scale: 1.1 }}
          onHoverStart={() => setHoveredCell(index)}
          onHoverEnd={() => setHoveredCell(null)}
        >
          {hoveredCell === index && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap">
              <p className="font-medium">{cell.day}</p>
              <p>{cell.label}: {cell.value}</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
} 