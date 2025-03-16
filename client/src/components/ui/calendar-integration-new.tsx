import { CalendarConnectButton } from '@/components/ui/calendar-connect-button';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface CalendarIntegrationProps {
  studyPlanId: number;
  onIntegrationComplete?: () => void;
}

const CalendarIntegration = ({ studyPlanId, onIntegrationComplete }: CalendarIntegrationProps) => {
  const { toast } = useToast();

  const integrationMutation = useMutation({
    mutationFn: async (provider: "google" | "microsoft" | "apple") => {
      return apiRequest(`/api/study-plans/${studyPlanId}/calendar-integration`, {
        method: 'POST',
        body: JSON.stringify({ provider })
      });
    },
    onSuccess: () => {
      toast({
        title: 'Calendar Connected',
        description: 'Successfully connected to calendar service.'
      });
      onIntegrationComplete?.();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: 'Failed to connect to calendar service. Please try again.'
      });
    }
  });

  const handleConnect = async (provider: "google" | "microsoft" | "apple") => {
    await integrationMutation.mutateAsync(provider);
  };

  return (
    <CalendarConnectButton
      onConnect={handleConnect}
      onCancel={() => onIntegrationComplete?.()}
    />
  );
}

export default CalendarIntegration;