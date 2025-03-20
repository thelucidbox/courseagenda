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
  opacity?: number;
}

export function FloatingShape({ 
  type, 
  color = 'purple', 
  top, 
  bottom, 
  left, 
  right, 
  size = 'sm',
  className = '',
  opacity = 0.7
}: FloatingShapeProps) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10'
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
    opacity: opacity,
    zIndex: 1
  } as React.CSSProperties;
  
  return (
    <div className={`${sizeClass} ${colorClass} ${className}`} style={style}>
      {type === 'star' && <Star strokeWidth={2} fill="currentColor" />}
      {type === 'circle' && <Circle strokeWidth={2} />}
      {type === 'plus' && <Plus strokeWidth={2} />}
      {type === 'donut' && (
        <div className="rounded-full border-2 border-current w-full h-full"></div>
      )}
    </div>
  );
}