import React from 'react';
import { Star, Circle, Plus } from 'lucide-react';

export interface FloatingShapeProps {
  type: 'star' | 'circle' | 'plus' | 'donut';
  color?: 'purple' | 'accent';
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FloatingShape({ 
  type, 
  color = 'purple', 
  top, 
  bottom, 
  left, 
  right, 
  size = 'sm',
  className
}: FloatingShapeProps) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }[size];
  
  const colorClass = {
    purple: 'text-[#7209B7]',
    accent: 'text-[#FFB627]'
  }[color];
  
  const style = {
    position: 'absolute',
    top: top,
    bottom: bottom,
    left: left,
    right: right,
    zIndex: 0
  } as React.CSSProperties;
  
  return (
    <div className={`${sizeClass} ${colorClass} opacity-70 ${className || ''}`} style={style}>
      {type === 'star' && <Star />}
      {type === 'circle' && <Circle />}
      {type === 'plus' && <Plus />}
      {type === 'donut' && (
        <div className="rounded-full border-2 border-current w-full h-full"></div>
      )}
    </div>
  );
}