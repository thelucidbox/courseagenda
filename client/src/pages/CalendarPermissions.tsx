import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ProgressSteps from '@/components/ui/progress-steps';
import { integrationProviders } from '@/lib/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Info, ArrowRight, Calendar } from 'lucide-react';
import { type Syllabus } from '@shared/schema';

const steps = [
  { label: 'Upload Syllabus', status: 'completed' as const },
  { label: 'Calendar Permissions', status: 'current' as const },
  { label: 'Extract Information', status: 'upcoming' as const },
  { label: 'Create Study Plan', status: 'upcoming' as const }
];

const CalendarPermissions = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string>('google');

  // Fetch syllabus data
  const { data: syllabus, isLoading } = useQuery<Syllabus>({
    queryKey: [`/api/syllabi/${id}`],
  });

  const calendarPermissionMutation = useMutation({
    mutationFn: async () => {
      // Here we would normally request calendar permission from the selected provider
      // For now, we'll just update the syllabus to indicate we have permissions
      return await apiRequest('POST', `/api/syllabi/${id}/calendar-permissions`, {
        provider: selectedProvider
      });
    },
    onSuccess: () => {
      toast({
        title: 'Calendar Permission Granted',
        description: 'You have granted access to your calendar for course scheduling.',
      });
      
      // Navigate to extract information page
      navigate(`/extract/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Permission Failed',
        description: error.message || 'Could not get calendar permissions. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const handleSkip = () => {
    toast({
      title: 'Calendar Access Skipped',
      description: 'You can add calendar integration later.',
    });
    navigate(`/extract/${id}`);
  };

  return (
    <div>
      <ProgressSteps steps={steps} currentStep={2} />
      
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Calendar Permissions
          </CardTitle>
          <CardDescription>
            Grant permission to access your calendar for better scheduling of course events and study sessions
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <Info className="h-5 w-5 text-yellow-500" />
            <p className="text-sm text-yellow-700">
              Granting calendar access now will help us create more accurate study plans with your class schedule. 
              You can always skip this step and add calendar integration later.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Select Calendar Provider</h3>
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
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-medium text-blue-800 mb-2">What happens when you grant permission?</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
              <li>We'll automatically create calendar events for your classes</li>
              <li>Your study plans will be added to your calendar</li>
              <li>You'll receive reminders before important deadlines</li>
              <li>We'll only add events - we won't modify your existing calendar entries</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleSkip}>
            Skip for Now
          </Button>
          <Button 
            onClick={() => calendarPermissionMutation.mutate()}
            disabled={calendarPermissionMutation.isPending}
          >
            {calendarPermissionMutation.isPending ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">⟳</span> Processing...
              </span>
            ) : (
              <span className="flex items-center">
                Grant Permission <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CalendarPermissions;