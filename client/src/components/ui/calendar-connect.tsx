import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { toast } from "@/hooks/use-toast";
import { FcGoogle } from "react-icons/fc";
import { SiMicrosoftoutlook } from "react-icons/si";
import { IoCalendar } from "react-icons/io5";

type CalendarProvider = "google" | "microsoft" | "apple";

interface CalendarConnectProps {
  onConnect?: (provider: CalendarProvider) => void;
  onCancel?: () => void;
}

export function CalendarConnect({ onConnect, onCancel }: CalendarConnectProps) {
  const [selectedProvider, setSelectedProvider] = useState<CalendarProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const handleConnect = async (provider: CalendarProvider) => {
    try {
      setIsConnecting(true);
      setSelectedProvider(provider);
      
      // For Google Calendar, redirect to the OAuth flow
      if (provider === "google") {
        window.location.href = "/api/auth/google/calendar";
        return;
      }
      
      // For other providers, show a "coming soon" message
      toast({
        title: "Coming Soon",
        description: `Integration with ${provider} calendar will be available soon!`,
      });
      
      onConnect?.(provider);
    } catch (error) {
      console.error("Calendar connection error:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect to calendar service. Please try again.",
      });
    } finally {
      setIsConnecting(false);
      setSelectedProvider(null);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connect Your Calendar</CardTitle>
        <CardDescription>
          Choose your calendar provider to automatically sync your study sessions
          and course events.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleConnect("google")}
            disabled={isConnecting}
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Connect Google Calendar
            {isConnecting && selectedProvider === "google" && (
              <Icons.spinner className="ml-auto h-4 w-4 animate-spin" />
            )}
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleConnect("microsoft")}
            disabled={isConnecting}
          >
            <SiMicrosoftoutlook className="mr-2 h-5 w-5 text-blue-500" />
            Connect Microsoft Calendar
            {isConnecting && selectedProvider === "microsoft" && (
              <Icons.spinner className="ml-auto h-4 w-4 animate-spin" />
            )}
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleConnect("apple")}
            disabled={isConnecting}
          >
            <IoCalendar className="mr-2 h-5 w-5" />
            Connect Apple Calendar
            {isConnecting && selectedProvider === "apple" && (
              <Icons.spinner className="ml-auto h-4 w-4 animate-spin" />
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full"
          disabled={isConnecting}
        >
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}