import { cn } from "@/lib/utils";

export type Step = {
  label: string;
  description?: string;
  status: 'upcoming' | 'current' | 'completed';
};

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  showLabels?: boolean;
}

const ProgressSteps = ({ 
  steps, 
  currentStep, 
  showLabels = true
}: ProgressStepsProps) => {
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-900">Turn Your Syllabus into a Study Plan</h2>
        <span className="text-sm text-gray-500">Step {currentStep} of {steps.length}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-primary h-2.5 rounded-full" 
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      
      {showLabels && (
        <div className="flex justify-between mt-2 text-xs">
          {steps.map((step, index) => (
            <span 
              key={index}
              className={cn(
                "transition-colors",
                step.status === 'completed' && "font-medium text-primary",
                step.status === 'current' && "font-medium text-primary-800",
                step.status === 'upcoming' && "text-gray-500"
              )}
            >
              {step.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressSteps;
