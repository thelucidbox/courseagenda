import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import { CalendarRange, NotebookPen, CalendarCheck, UserCircle2 } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, isLoading, loginWithGoogle } = useAuth();

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-10 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <div className="grid gap-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-7 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-gray-200"></div>
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container max-w-6xl mx-auto py-10 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view and manage your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-10">
            <UserCircle2 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="mb-6">You need to be signed in to access your profile and calendar integrations</p>
            <Button onClick={loginWithGoogle} className="mt-2">
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      
      <div className="grid gap-6">
        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Manage your account and integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.profileImage} alt={user?.name || user?.username} />
                <AvatarFallback>{getInitials(user?.name || user?.username || "")}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{user?.name || user?.username}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            {/* Account Information */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Account Type</h4>
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">Google Account</Badge>
                  {user?.googleId && (
                    <Badge variant="secondary">Connected</Badge>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Member Since</h4>
                <p className="text-sm text-muted-foreground">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Subscription Management Card */}
        <Card className="bg-gradient-to-br from-background to-background/90 border-primary/20">
          <CardHeader>
            <CardTitle>Your Subscription</CardTitle>
            <CardDescription>
              Manage your CourseAgenda subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Current Plan</h3>
                <Badge 
                  className={user?.subscriptionStatus === 'premium' 
                    ? 'bg-green-500'
                    : user?.subscriptionStatus === 'lifetime' 
                    ? 'bg-purple-600' 
                    : 'bg-blue-500'
                  }
                >
                  {user?.subscriptionStatus === 'premium' 
                    ? 'Premium' 
                    : user?.subscriptionStatus === 'lifetime' 
                    ? 'Lifetime' 
                    : 'Free Tier'}
                </Badge>
              </div>
              
              <div className="space-y-1 mb-4">
                {user?.subscriptionStatus === 'premium' && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Your premium subscription is active.
                    </p>
                    {user?.subscriptionExpiry && (
                      <p className="text-sm font-medium">
                        Renews on: {new Date(user.subscriptionExpiry).toLocaleDateString()}
                      </p>
                    )}
                  </>
                )}
                
                {user?.subscriptionStatus === 'lifetime' && (
                  <p className="text-sm text-muted-foreground">
                    You have lifetime access to all premium features. Thank you for your support!
                  </p>
                )}
                
                {(!user?.subscriptionStatus || user?.subscriptionStatus === 'free') && (
                  <p className="text-sm text-muted-foreground">
                    You're currently on the free plan with limited features.
                  </p>
                )}
              </div>
              
              <Separator className="my-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Premium Annual Plan */}
                <div className="rounded-lg border border-primary/20 p-4 bg-card">
                  <h4 className="font-medium mb-2">Annual Premium</h4>
                  <div className="flex items-baseline mb-2">
                    <span className="text-2xl font-bold">$5</span>
                    <span className="text-muted-foreground ml-1">/year</span>
                  </div>
                  <ul className="space-y-2 mb-4 text-sm">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Unlimited syllabus uploads
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Calendar integrations
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Study session reminders
                    </li>
                  </ul>
                  <Button 
                    className="w-full" 
                    disabled={user?.subscriptionStatus === 'premium' || user?.subscriptionStatus === 'lifetime'}
                  >
                    {user?.subscriptionStatus === 'premium' 
                      ? 'Current Plan' 
                      : user?.subscriptionStatus === 'lifetime' 
                      ? 'Already on Lifetime' 
                      : 'Upgrade to Premium'}
                  </Button>
                </div>
                
                {/* Lifetime Plan */}
                <div className="rounded-lg border border-primary/20 p-4 bg-card relative overflow-hidden">
                  {/* Best Value Badge */}
                  <div className="absolute right-0 top-0">
                    <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 transform translate-x-[40%] translate-y-[-30%] rotate-45">
                      Best Value
                    </div>
                  </div>
                  
                  <h4 className="font-medium mb-2">Lifetime Access</h4>
                  <div className="flex items-baseline mb-2">
                    <span className="text-2xl font-bold">$50</span>
                    <span className="text-muted-foreground ml-1">one-time</span>
                  </div>
                  <ul className="space-y-2 mb-4 text-sm">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Everything in Premium
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      No annual renewals
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Support future development
                    </li>
                  </ul>
                  <Button 
                    variant="outline"
                    className="w-full border-primary border-2 hover:bg-primary hover:text-primary-foreground" 
                    disabled={user?.subscriptionStatus === 'lifetime'}
                  >
                    {user?.subscriptionStatus === 'lifetime' ? 'Current Plan' : 'Get Lifetime Access'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Calendar Integrations Card */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar Integrations</CardTitle>
            <CardDescription>
              Manage your calendar connections for study planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Google Calendar */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <CalendarRange className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <h4 className="font-medium">Google Calendar</h4>
                    <p className="text-sm text-muted-foreground">
                      Sync study sessions and deadlines with your Google Calendar
                    </p>
                  </div>
                </div>
                <Badge variant={user?.googleId ? "default" : "outline"} className={user?.googleId ? "bg-green-500" : ""}>
                  {user?.googleId ? "Connected" : "Not Connected"}
                </Badge>
              </div>
              
              {/* ICS Downloads */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <CalendarCheck className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <h4 className="font-medium">Calendar Downloads (ICS)</h4>
                    <p className="text-sm text-muted-foreground">
                      Download calendar files compatible with Apple Calendar, Outlook, and others
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-500">Available</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4">
            <p className="text-sm text-muted-foreground">
              Your study plans can be synced with your calendar to help you stay organized and on track with your learning goals.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/courses">
                  <NotebookPen className="mr-2 h-4 w-4" />
                  View Your Courses
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}