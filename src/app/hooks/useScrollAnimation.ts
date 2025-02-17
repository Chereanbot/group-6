"use client";

import { useEffect, useState } from 'react';

export const useScrollAnimation = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrollingUp(currentScrollY < lastScrollY);
      setLastScrollY(currentScrollY);
      setScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const getScrollProgress = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return scrollY / docHeight;
  };

  return {
    scrollY,
    isScrollingUp,
    scrollProgress: getScrollProgress(),
  };
};

export default useScrollAnimation;
