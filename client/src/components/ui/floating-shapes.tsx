import React from 'react';

type ShapeType = 'circle' | 'square' | 'triangle' | 'donut' | 'star' | 'plus';
type ShapeColor = 'purple' | 'accent' | 'light';
type ShapeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface FloatingShapeProps {
  type: ShapeType;
  color: ShapeColor;
  size: ShapeSize;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  rotate?: string;
  opacity?: number;
  zIndex?: number;
  animate?: boolean;
  className?: string;
}

export const FloatingShape: React.FC<FloatingShapeProps> = ({
  type,
  color,
  size,
  top,
  bottom,
  left,
  right,
  rotate = '0deg',
  opacity = 0.7, // Default opacity to 0.7 like in floating-shape CSS class
  zIndex = 0,
  animate = true,
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  const colorMap: Record<ShapeColor, string> = { // Explicitly type colorMap
    purple: 'text-prodigy-purple', // Use Tailwind theme color class
    accent: 'text-prodigy-yellow', // Use Tailwind theme color class (assuming accent means yellow here)
    light: 'text-prodigy-light-blue', // Example: if 'light' means a themeable light blue
  };

  // Fallback for 'light' if it's not in the theme, or adjust as needed
  // if (!colorMap[color] && color === 'light') colorMap.light = 'text-gray-200'; // Example fallback

  const getShapeSvg = () => {
    switch (type) {
      case 'circle':
        return (
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="currentColor" />
          </svg>
        );
      case 'square':
        return (
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="15" fill="currentColor" />
          </svg>
        );
      case 'triangle':
        return (
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,0 100,100 0,100" fill="currentColor" />
          </svg>
        );
      case 'donut':
        return (
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="currentColor" />
            <circle cx="50" cy="50" r="25" fill="white" />
          </svg>
        );
      case 'star':
        return (
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon
              points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35"
              fill="currentColor"
            />
          </svg>
        );
      case 'plus':
        return (
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="35" y="0" width="30" height="100" rx="10" fill="currentColor" />
            <rect x="0" y="35" width="100" height="30" rx="10" fill="currentColor" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="currentColor" />
          </svg>
        );
    }
  };

  const animationClass = animate
    ? 'animate-floating'
    : '';

  const style = {
    top,
    bottom,
    left,
    right,
    transform: `rotate(${rotate})`,
    opacity,
    zIndex,
  };

  return (
    <div
      className={`absolute pointer-events-none ${sizeMap[size]} ${colorMap[color] || 'text-prodigy-purple'} ${animationClass} ${className}`} // Added pointer-events-none, fallback color
      style={style}
    >
      {getShapeSvg()}
    </div>
  );
};

// DecorativeShapes component uses FloatingShape, so it will benefit from these changes.
// Its own opacity overrides will still apply.
export const DecorativeShapes: React.FC<{ variant?: 'light' | 'dark' }> = ({ variant = 'light' }) => {
  // Ensuring colors passed here are valid ShapeColor types defined above
  // The actual color values will be resolved by the updated colorMap in FloatingShape
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <FloatingShape type="circle" color="purple" top="5%" left="8%" size="md" opacity={0.6} />
      <FloatingShape type="donut" color="accent" top="10%" right="15%" size="sm" /> 
      <FloatingShape type="star" color="purple" bottom="15%" right="10%" size="sm" />
      <FloatingShape type="plus" color="accent" bottom="25%" left="15%" size="sm" opacity={0.7} />
      <FloatingShape type="triangle" color="purple" top="40%" right="5%" size="sm" opacity={0.4} rotate="45deg" />
      <FloatingShape type="square" color="accent" bottom="10%" left="30%" size="xs" opacity={0.5} rotate="15deg" />
    </div>
  );
};