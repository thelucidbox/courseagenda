import React from "react";
import { cn } from "@/lib/utils";
import { FloatingShape } from "./decorative-elements";
import { LucideIcon } from "lucide-react";

interface ProdigyCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export function ProdigyCard({ className, children, hover = true, ...props }: ProdigyCardProps) {
  return (
    <div
      className={cn(
        "prodigy-card p-6",
        hover && "hover:scale-[1.02] transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  number?: number;
}

export function FeatureCard({ className, title, description, icon: Icon, number, ...props }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "feature-card hover:scale-[1.02] transition-all duration-300",
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
          
          <h3 className="text-white font-bold text-xl tracking-wide">{title}</h3>
        </div>
        <p className="text-white/90 ml-0 lg:ml-16">{description}</p>
      </div>
      
      {/* Additional decorative elements */}
      <FloatingShape type="circle" color="secondary" top="70%" left="10%" size="sm" />
      <FloatingShape type="plus" color="accent" bottom="10%" right="10%" size="sm" />
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

export function TestimonialCard({ className, quote, author, role, avatar, rating, ...props }: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "testimonial-card hover:scale-[1.02] transition-all duration-300",
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
              className={`w-5 h-5 ${i < rating ? "text-prodigy-yellow" : "text-gray-200"}`} 
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
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img src={avatar} alt={author} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
        
        <div>
          <p className="font-semibold text-text-primary">{author}</p>
          {role && <p className="text-sm text-text-secondary">{role}</p>}
        </div>
      </div>
    </div>
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

export function CourseCard({ className, title, description, image, progress, dueDate, ...props }: CourseCardProps) {
  return (
    <div
      className={cn(
        "prodigy-card hover:scale-[1.02] transition-all duration-300 flex flex-col",
        className
      )}
      {...props}
    >
      {/* Course image if provided */}
      {image && (
        <div className="h-40 rounded-t-xl overflow-hidden -mx-6 -mt-6 mb-4">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      
      <h3 className="font-bold text-xl mb-2 text-text-primary">{title}</h3>
      
      {description && (
        <p className="text-text-secondary text-sm mb-4">{description}</p>
      )}
      
      {/* Progress bar if provided */}
      {progress !== undefined && (
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-text-secondary">Progress</span>
            <span className="text-xs font-medium text-prodigy-purple">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-prodigy-purple h-2 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Due date if provided */}
      {dueDate && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center">
          <svg className="w-4 h-4 text-prodigy-purple mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-text-secondary">Due: {dueDate}</span>
        </div>
      )}
    </div>
  );
}

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: number;
  className?: string;
}

export function StatCard({ className, title, value, icon: Icon, trend, ...props }: StatCardProps) {
  return (
    <div
      className={cn(
        "prodigy-card p-5",
        className
      )}
      {...props}
    >
      <div className="flex justify-between">
        <div>
          <p className="text-text-secondary text-sm mb-1">{title}</p>
          <p className="text-text-primary text-2xl font-bold">{value}</p>
          
          {trend !== undefined && (
            <div className={`flex items-center mt-2 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
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
          <div className="bg-prodigy-light-blue rounded-lg p-3 text-prodigy-purple">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}