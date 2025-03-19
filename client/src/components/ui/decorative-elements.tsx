import React from "react";

type ShapeType = "star" | "circle" | "plus" | "donut" | "square" | "triangle";
type ShapeSize = "sm" | "md" | "lg";
type ShapeColor = "primary" | "secondary" | "accent";

interface FloatingShapeProps {
  type: ShapeType;
  size?: ShapeSize;
  color?: ShapeColor;
  className?: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  delay?: number;
}

export function FloatingShape({
  type,
  size = "md",
  color = "primary",
  className = "",
  top,
  bottom,
  left,
  right,
  delay = 0,
}: FloatingShapeProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  };
  
  const colorClasses = {
    primary: "text-prodigy-purple",
    secondary: "text-prodigy-yellow",
    accent: "text-prodigy-light-blue",
  };
  
  const positionStyle = {
    top: top,
    bottom: bottom,
    left: left,
    right: right,
    animationDelay: delay ? `${delay}s` : undefined,
  };
  
  const renderShape = () => {
    switch (type) {
      case "star":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.2-6.3-4.6-6.3 4.6 2.3-7.2-6-4.6h7.6z" />
          </svg>
        );
      case "circle":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
      case "plus":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
        );
      case "donut":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="8" />
          </svg>
        );
      case "square":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
        );
      case "triangle":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 22H22L12 2Z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`floating-shape ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      style={positionStyle}
    >
      {renderShape()}
    </div>
  );
}

export function DecorativeBackground({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <FloatingShape type="star" color="secondary" top="10%" left="5%" />
      <FloatingShape type="circle" color="primary" top="15%" right="10%" size="sm" delay={0.5} />
      <FloatingShape type="plus" color="accent" bottom="25%" left="8%" size="lg" delay={1} />
      <FloatingShape type="donut" color="secondary" bottom="10%" right="15%" delay={1.5} />
      <FloatingShape type="triangle" color="primary" top="40%" right="5%" size="sm" delay={2} />
      {children}
    </div>
  );
}

export function HeroBackground({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Left top corner decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-prodigy-purple/20 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Right top decoration */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-prodigy-yellow/20 rounded-full filter blur-2xl"></div>
      
      {/* Bottom right decoration */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-prodigy-light-purple/15 rounded-full filter blur-3xl translate-x-1/3 translate-y-1/3"></div>
      
      {/* Floating shapes */}
      <FloatingShape type="star" color="secondary" top="20%" left="10%" />
      <FloatingShape type="circle" color="primary" top="30%" right="15%" size="sm" />
      <FloatingShape type="plus" color="accent" bottom="15%" left="20%" />
      <FloatingShape type="donut" color="secondary" bottom="30%" right="25%" />
      
      {children}
    </div>
  );
}

export function SectionDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-24 ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border/30"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-background px-4">
          <svg className="h-8 w-8 text-prodigy-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
      </div>
    </div>
  );
}

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  from?: string;
  to?: string;
}

export function GradientText({ 
  children, 
  className = "", 
  from = "from-prodigy-purple", 
  to = "to-prodigy-light-purple" 
}: GradientTextProps) {
  return (
    <span className={`bg-gradient-to-r ${from} ${to} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}