import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar, CheckCircle2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationProviders } from '@/lib/calendar';
import { Syllabus, StudyPlan, courseScheduleSchema } from '@shared/schema';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface CalendarIntegrationProps {
  studyPlanId: number;
  onIntegrationComplete?: () => void;
}

const CalendarIntegration = ({ studyPlanId, onIntegrationComplete }: CalendarIntegrationProps) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('google');
  const [integrating, setIntegrating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const integrationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/study-plans/${studyPlanId}/calendar-integration`, { 
        provider: selectedProvider 
      });
    },
    onSuccess: async () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/study-plans/${studyPlanId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/study-plans'] });
      
      toast({
        title: "Calendar Integration Successful",
        description: "Your study plan has been added to your calendar",
        variant: "default"
      });
      
      if (onIntegrationComplete) {
        onIntegrationComplete();
      }
    },
    onError: (error) => {
      toast({
        title: "Integration Failed",
        description: error.message || "Could not integrate with calendar. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleIntegrate = async () => {
    integrationMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Calendar Integration
        </CardTitle>
        <CardDescription>Add your study plan to your preferred calendar service</CardDescription>
      </CardHeader>
      
      <CardContent>
        <RadioGroup
          value={selectedProvider}
          onValueChange={setSelectedProvider}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {integrationProviders.map(provider => (
            <div key={provider.id}>
              <RadioGroupItem
                value={provider.id}
                id={provider.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={provider.id}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <provider.icon className="mb-3 h-6 w-6" />
                <span className="font-medium">{provider.name}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleIntegrate} 
          className="w-full"
          disabled={integrationMutation.isPending}
        >
          {integrationMutation.isPending ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2">⟳</span> Integrating...
            </span>
          ) : (
            <span className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Add to Calendar
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CalendarIntegration;
