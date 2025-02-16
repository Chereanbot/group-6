"use client";

import { useState } from 'react';
import { getAvatarUrl } from '@/utils/avatar';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar = ({ src, name, size = 'md', className = '' }: AvatarProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <img
      src={imgSrc || getAvatarUrl(name)}
      alt={name}
      className={`rounded-full ${sizes[size]} ${className}`}
      onError={() => setImgSrc(getAvatarUrl(name))}
    />
  );
};

export default Avatar; 