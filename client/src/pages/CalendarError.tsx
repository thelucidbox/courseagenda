import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Link } from "wouter";

export default function CalendarError() {
  return (
    <div className="container max-w-lg mx-auto mt-20 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Icons.alertCircle className="h-6 w-6" />
            Calendar Connection Failed
          </CardTitle>
          <CardDescription>
            There was a problem connecting to your calendar. This could be due to:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>Permissions were not granted for calendar access</li>
            <li>The connection was cancelled</li>
            <li>A technical error occurred during the process</li>
          </ul>
          <p className="mt-4 text-sm">
            Please try connecting again. If the problem persists, you can still use
            the ICS file download option to add events to your calendar manually.
          </p>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Link to="/calendar-integration">
            <Button>Try Again</Button>
          </Link>
          <Link to="/study-plans">
            <Button variant="ghost">Return to Study Plans</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}