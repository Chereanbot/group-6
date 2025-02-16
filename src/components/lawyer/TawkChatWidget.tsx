"use client";

import { useEffect } from 'react';

declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}

interface Props {
  lawyer?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export function TawkChatWidget({ lawyer }: Props) {
  useEffect(() => {
    // Initialize Tawk.to
    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/6767e8b149e2fd8dfefbd7bf/1ifmu9thn';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode?.insertBefore(s1, s0);

    // Configure visitor information when Tawk is ready
    if (lawyer) {
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_API.onLoad = function() {
        window.Tawk_API.setAttributes({
          name: lawyer.fullName,
          email: lawyer.email,
          id: lawyer.id,
          role: 'Lawyer'
        });
      };
    }

    // Cleanup
    return () => {
      s1.remove();
      delete window.Tawk_API;
      delete window.Tawk_LoadStart;
    };
  }, [lawyer]);

  return null;
} 