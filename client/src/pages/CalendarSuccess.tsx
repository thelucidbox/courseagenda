import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Link } from "wouter";

export default function CalendarSuccess() {
  return (
    <div className="container max-w-lg mx-auto mt-20 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Icons.check className="h-6 w-6" />
            Calendar Connected Successfully
          </CardTitle>
          <CardDescription>
            Your calendar has been connected successfully. You can now sync your study sessions
            and course events with your calendar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your study sessions will be automatically added to your calendar when you create them.
            You can manage your calendar settings at any time from your study plan settings.
          </p>
        </CardContent>
        <CardFooter>
          <Link to="/study-plans">
            <Button>Return to Study Plans</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}