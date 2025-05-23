import React from "react";
import { cn } from "@/lib/utils";
import { FloatingShape } from "./decorative-elements"; // Assuming FloatingShape is already compliant or out of scope for this refactor
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card"; // Import the standardized Card

interface ProdigyCardProps extends React.HTMLAttributes<HTMLDivElement> { 
  className?: string;
  children: React.ReactNode;
  // hoverEffect prop removed as base Card now handles hover effects by default.
  // If a card needs to specifically disable hover, a new prop like `disableBaseHover` could be introduced.
}

// Refactored ProdigyCard to use the standardized Card component
export function ProdigyCard({ className, children, ...props }: ProdigyCardProps) {
  return (
    <Card // Uses the standardized Card component which has hover effects
      className={cn(
        "p-6", // Default padding for this specific card type
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  number?: number;
}

// FeatureCard retains its specific styling class but could be built upon Card if desired for base attributes
export function FeatureCard({ className, title, description, icon: Icon, number, ...props }: FeatureCardProps) {
  return (
    // Using a div with feature-card class for now, as its base style is very different from default Card.
    // Alternatively, <Card className="feature-card ...overrides..."> could be used.
    <div
      className={cn(
        "feature-card p-6", // p-6 is from original feature-card css, ensure it's here or in the class
        "hover:scale-[1.02] transition-transform duration-300", // Custom hover effect
        className
      )}
      {...props}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mt-8 -mr-8"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-3">
          {Icon && (
            <div className="bg-prodigy-yellow text-prodigy-purple rounded-full p-2.5 w-12 h-12 flex items-center justify-center shrink-0">
              <Icon className="h-6 w-6" />
            </div>
          )}
          
          {number !== undefined && (
            <div className="text-prodigy-yellow text-3xl font-extrabold mr-2">
              {number}.
            </div>
          )}
          
          <h3 className="text-white font-bold text-xl tracking-wide">{title}</h3> {/* text-white is part of feature-card style */}
        </div>
        <p className="text-white/90 ml-0 lg:ml-16">{description}</p> {/* text-white/90 is part of feature-card style */}
      </div>
      
      {/* Additional decorative elements - using theme color names */}
      <FloatingShape type="circle" color="prodigy-yellow" top="70%" left="10%" size="sm" />
      <FloatingShape type="plus" color="prodigy-light-blue" bottom="10%" right="10%" size="sm" />
    </div>
  );
}

interface TestimonialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  rating?: number;
}

// Refactored TestimonialCard to use the standardized Card component
export function TestimonialCard({ className, quote, author, role, avatar, rating, ...props }: TestimonialCardProps) {
  return (
    <Card // Uses the standardized Card component which has hover effects
      className={cn(
        "p-6", // testimonial-card in CSS already includes p-6
        // Removed redundant hover:scale, base Card handles it.
        className
      )}
      {...props}
    >
      {/* Rating stars if provided */}
      {rating && (
        <div className="flex mb-3">
          {[...Array(5)].map((_, i) => (
            <svg 
              key={i} 
              className={`w-5 h-5 ${i < rating ? "text-prodigy-yellow" : "text-muted-foreground/30"}`} // Use theme color for inactive stars
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      )}
      
      {/* Quote */}
      <p className="text-text-body mb-6 italic">"{quote}"</p>
      
      {/* Author information */}
      <div className="flex items-center">
        {avatar && (
          <div className="mr-4">
            <div className="w-10 h-10 rounded-full overflow-hidden"> {/* Ensure consistent rounding if needed */}
              <img src={avatar} alt={author} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
        
        <div>
          <p className="font-semibold text-text-primary">{author}</p>
          {role && <p className="text-sm text-text-secondary">{role}</p>}
        </div>
      </div>
    </Card>
  );
}

interface CourseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  image?: string;
  progress?: number;
  dueDate?: string;
  className?: string;
}

// Refactored CourseCard to use the standardized Card component
export function CourseCard({ className, title, description, image, progress, dueDate, ...props }: CourseCardProps) {
  return (
    <Card // Uses the standardized Card component which has hover effects
      className={cn(
        "p-6 flex flex-col", // Default padding and flex layout for this card type
        // Removed redundant hover:scale, base Card handles it.
        className
      )}
      {...props}
    >
      {/* Course image if provided */}
      {image && (
        // Adjusting negative margins for image to work with padding on Card
        <div className="h-40 rounded-t-xl overflow-hidden -mx-6 -mt-6 mb-6"> 
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      
      <h3 className="font-bold text-xl mb-2 text-text-primary">{title}</h3>
      
      {description && (
        <p className="text-text-secondary text-sm mb-4">{description}</p>
      )}
      
      {/* Progress bar if provided */}
      {progress !== undefined && (
        <div className="mt-auto"> {/* Ensures progress bar is at the bottom for flex-col */}
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-text-secondary">Progress</span>
            <span className="text-xs font-medium text-prodigy-purple">{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2"> {/* Use bg-muted for progress background */}
            <div 
              className="bg-prodigy-purple h-2 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Due date if provided */}
      {dueDate && (
        <div className="mt-4 pt-4 border-t border-border flex items-center"> {/* Use border-border */}
          <svg className="w-4 h-4 text-prodigy-purple mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-text-secondary">Due: {dueDate}</span>
        </div>
      )}
    </Card>
  );
}

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: number;
  className?: string;
}

// Refactored StatCard to use the standardized Card component
export function StatCard({ className, title, value, icon: Icon, trend, ...props }: StatCardProps) {
  return (
    <Card // Uses the standardized Card component
      className={cn(
        "p-5", // Specific padding for StatCard
        // Note: hover:scale effect not specified for StatCard in original, so not added here. Can be added via props if needed.
        className
      )}
      {...props}
    >
      <div className="flex justify-between items-center"> {/* Added items-center for better alignment if icon and text have different heights */}
        <div>
          <p className="text-text-secondary text-sm mb-1">{title}</p>
          <p className="text-text-primary text-2xl font-bold">{value}</p>
          
          {trend !== undefined && (
            <div className={`flex items-center mt-2 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}> {/* Standard trend colors are fine */}
              <svg 
                className="w-4 h-4 mr-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={trend >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} 
                />
              </svg>
              <span className="text-xs font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className="bg-prodigy-light-blue rounded-lg p-3 text-prodigy-purple"> {/* Consistent styling */}
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </Card>
  );
}