import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function CalendarSuccess() {
  return (
    <div className="container max-w-md mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle>Successfully Connected!</CardTitle>
              <CardDescription>
                Your calendar has been connected and your study schedule will be synced.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All your study sessions and course events will be added to your calendar with
            the reminder preferences you've set. You can modify these events directly in
            your calendar application.
          </p>
        </CardContent>
        <CardFooter>
          <Link to="/courses">
            <Button className="w-full">Return to Courses</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}