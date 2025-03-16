import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { Link } from "wouter";

export default function CalendarError() {
  return (
    <div className="container max-w-md mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle>Connection Failed</CardTitle>
              <CardDescription>
                We couldn't connect to your calendar service.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This could be due to a temporary issue or because you didn't grant the
            necessary permissions. Please try again and make sure to allow access to
            your calendar when prompted.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link to="/courses">
            <Button className="w-full">Return to Courses</Button>
          </Link>
          <Link to="/calendar-connect">
            <Button variant="outline" className="w-full">
              Try Again
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}