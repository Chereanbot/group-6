"use client";

import { motion, useSpring } from 'framer-motion';
import useScrollAnimation from '../hooks/useScrollAnimation';

const ScrollProgress = () => {
  const { scrollProgress } = useScrollAnimation();
  const scaleX = useSpring(scrollProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-left z-50"
      style={{ scaleX }}
    />
  );
};

export default ScrollProgress;
