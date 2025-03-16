import React, { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { integrationProviders, CalendarProvider } from '@/lib/calendar';
import { apiRequest } from '@/lib/queryClient';
import MainLayout from '@/components/layout/MainLayout';

const CalendarPermissions: React.FC = () => {
  const [_, params] = useRoute<{ id: string }>('/calendar-permissions/:id');
  const syllabusId = params?.id ? parseInt(params.id) : null;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const handlePermissionMutation = useMutation({
    mutationFn: async (provider: string) => {
      if (!syllabusId) {
        throw new Error("No syllabus ID provided");
      }
      
      return apiRequest({
        url: `/api/syllabi/${syllabusId}/calendar-permissions`,
        method: 'POST',
        data: { provider }
      });
    },
    onSuccess: () => {
      toast({
        title: 'Calendar Permissions Granted',
        description: 'You can now upload a syllabus and create study plans!',
      });
      
      // Navigate to syllabus upload or info extraction depending on the flow
      if (syllabusId) {
        navigate(`/extract-info/${syllabusId}`);
      } else {
        navigate('/upload-syllabus');
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to set calendar permissions: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleProviderSelect = (provider: string) => {
    setSelectedProvider(provider);
    handlePermissionMutation.mutate(provider);
  };

  const handleSkip = () => {
    toast({
      title: 'Skipped Calendar Integration',
      description: 'You can always integrate your calendar later.',
    });
    
    if (syllabusId) {
      navigate(`/extract-info/${syllabusId}`);
    } else {
      navigate('/upload-syllabus');
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Calendar Integration
            </CardTitle>
            <CardDescription className="text-center text-lg">
              Connect your calendar to automatically add study sessions and course events
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-center mb-2">
              Select your preferred calendar provider:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {integrationProviders.map((provider: CalendarProvider) => {
                const Icon = provider.icon;
                return (
                  <Button
                    key={provider.id}
                    variant="outline"
                    className={`h-20 flex flex-col items-center justify-center gap-2 ${
                      selectedProvider === provider.id ? 'border-primary ring-2 ring-primary' : ''
                    } ${handlePermissionMutation.isPending && selectedProvider === provider.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={handlePermissionMutation.isPending}
                    onClick={() => handleProviderSelect(provider.id)}
                    style={{ 
                      borderColor: selectedProvider === provider.id ? provider.color : undefined,
                      borderWidth: selectedProvider === provider.id ? '2px' : '1px'
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: provider.color }} />
                    <span>{provider.name}</span>
                  </Button>
                );
              })}
            </div>
            
            <Separator className="my-6" />
            
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">Why connect your calendar?</h3>
              <ul className="text-left list-disc space-y-2 pl-6">
                <li>Automatically add your class schedule to your calendar</li>
                <li>Sync assignment deadlines and exam dates</li>
                <li>Get reminders for your study sessions</li>
                <li>Ensure you never miss an important deadline</li>
              </ul>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={handlePermissionMutation.isPending}
              className="w-full sm:w-auto"
            >
              I'll do this later
            </Button>
            
            {selectedProvider && handlePermissionMutation.isPending && (
              <Button disabled className="w-full sm:w-auto">
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                Connecting...
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CalendarPermissions;