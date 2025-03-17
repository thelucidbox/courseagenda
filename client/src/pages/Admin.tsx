import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, Download, Trash2, Edit, UserPlus, Users, FileText, BookOpen, CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/utils";

// Define user types matching the schema
interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  createdAt: string;
  profileImage?: string;
  role: 'user' | 'admin';
  syllabusCount: number;
  studyPlanCount: number;
  subscriptionStatus?: 'free' | 'premium' | 'lifetime';
  subscriptionExpiry?: string;
}

// Define syllabus types matching the schema
interface Syllabus {
  id: number;
  userId: number;
  title: string;
  createdAt: string;
  courseCode?: string;
  courseName?: string;
  status: 'pending' | 'processed' | 'failed';
}

const AdminPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);

  // Fetch users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching users:", error);
        return [];
      }
    }
  });

  // Fetch syllabi
  const { data: syllabi = [], isLoading: isLoadingSyllabi } = useQuery({
    queryKey: ['/api/admin/syllabi'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/syllabi');
        if (!response.ok) {
          throw new Error('Failed to fetch syllabi');
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching syllabi:", error);
        return [];
      }
    }
  });
  
  // Fetch system stats
  const { data: systemStats = { userCount: 0, syllabusCount: 0, studyPlanCount: 0, studySessionCount: 0 }, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch system stats');
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching stats:", error);
        return { userCount: 0, syllabusCount: 0, studyPlanCount: 0, studySessionCount: 0 };
      }
    }
  });

  // Update user role
  const updateUserMutation = useMutation({
    mutationFn: async (data: { userId: number, updates: Partial<User> }) => {
      const response = await apiRequest('PATCH', `/api/admin/users/${data.userId}`, data.updates);
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "The user has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setUserDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update user: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete user
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Filter users based on search query
  const filteredUsers = users.filter((user: User) => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle user edit
  const handleUserEdit = (user: User) => {
    setCurrentUser(user);
    setUserDialogOpen(true);
  };

  // Handle user update
  const handleUserUpdate = () => {
    if (!currentUser || !currentUser.id) return;
    
    updateUserMutation.mutate({
      userId: currentUser.id,
      updates: {
        role: currentUser.role,
        subscriptionStatus: currentUser.subscriptionStatus,
        subscriptionExpiry: currentUser.subscriptionExpiry
      }
    });
  };

  // Determine subscription badge color
  const getSubscriptionBadge = (status?: string) => {
    switch (status) {
      case 'premium':
        return <Badge className="bg-green-500">Premium</Badge>;
      case 'lifetime':
        return <Badge className="bg-purple-500">Lifetime</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, syllabi, and system settings
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="syllabi">Syllabi</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all registered users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="search" 
                      placeholder="Search users..." 
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Subscription</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingUsers ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No users found. Adjust your search or filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user: User) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                  {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div>{user.name || user.username}</div>
                                  <div className="text-xs text-muted-foreground">@{user.username}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                                {user.role === 'admin' ? 'Admin' : 'User'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getSubscriptionBadge(user.subscriptionStatus)}
                            </TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Badge variant="outline">{user.syllabusCount} syllabi</Badge>
                                <Badge variant="outline">{user.studyPlanCount} plans</Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleUserEdit(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${user.username}?`)) {
                                    deleteUserMutation.mutate(user.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Syllabi Tab */}
          <TabsContent value="syllabi" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Syllabus Management</CardTitle>
                <CardDescription>
                  View and manage all uploaded syllabi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="search" 
                      placeholder="Search syllabi..." 
                      className="pl-8"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingSyllabi ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : syllabi.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No syllabi found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        syllabi.map((syllabus: Syllabus) => {
                          const user = users.find((u: User) => u.id === syllabus.userId);
                          return (
                            <TableRow key={syllabus.id}>
                              <TableCell className="font-medium">{syllabus.id}</TableCell>
                              <TableCell>
                                <div>
                                  <div>{syllabus.courseName || 'Untitled Course'}</div>
                                  <div className="text-xs text-muted-foreground">{syllabus.courseCode || 'No code'}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {user ? user.username : `User #${syllabus.userId}`}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    syllabus.status === 'processed' ? 'default' : 
                                    syllabus.status === 'failed' ? 'destructive' : 'outline'
                                  }
                                >
                                  {syllabus.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(syllabus.createdAt)}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            {/* System Stats Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle>System Statistics</CardTitle>
                <CardDescription>
                  Overview of system usage and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* User Count Card */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold">
                          {isLoadingStats ? (
                            <div className="animate-pulse w-12 h-8 bg-muted rounded"></div>
                          ) : (
                            systemStats.userCount
                          )}
                        </h2>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Syllabus Count Card */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold">
                          {isLoadingStats ? (
                            <div className="animate-pulse w-12 h-8 bg-muted rounded"></div>
                          ) : (
                            systemStats.syllabusCount
                          )}
                        </h2>
                        <p className="text-sm text-muted-foreground">Total Syllabi</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Study Plan Count Card */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold">
                          {isLoadingStats ? (
                            <div className="animate-pulse w-12 h-8 bg-muted rounded"></div>
                          ) : (
                            systemStats.studyPlanCount
                          )}
                        </h2>
                        <p className="text-sm text-muted-foreground">Study Plans</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Study Session Count Card */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <CalendarDays className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold">
                          {isLoadingStats ? (
                            <div className="animate-pulse w-12 h-8 bg-muted rounded"></div>
                          ) : (
                            systemStats.studySessionCount
                          )}
                        </h2>
                        <p className="text-sm text-muted-foreground">Study Sessions</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
            
            {/* System Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure application-wide settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Subscription Settings</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="annual-price">Annual Subscription Price ($)</Label>
                      <Input id="annual-price" placeholder="5.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lifetime-price">Lifetime Subscription Price ($)</Label>
                      <Input id="lifetime-price" placeholder="50.00" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">API Keys</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gemini-key">Gemini API Key</Label>
                      <Input id="gemini-key" type="password" placeholder="•••••••••••••••••" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Free Tier Limits</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="free-syllabi-limit">Number of Free Syllabi</Label>
                      <Input id="free-syllabi-limit" type="number" placeholder="1" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="free-study-plans-limit">Number of Free Study Plans</Label>
                      <Input id="free-study-plans-limit" type="number" placeholder="1" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions
            </DialogDescription>
          </DialogHeader>
          
          {currentUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 
                   currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="font-medium">{currentUser.name || currentUser.username}</h3>
                  <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <select
                  id="role"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={currentUser.role}
                  onChange={(e) => setCurrentUser({...currentUser, role: e.target.value as 'user' | 'admin'})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subscription">Subscription Status</Label>
                <select
                  id="subscription"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={currentUser.subscriptionStatus || 'free'}
                  onChange={(e) => setCurrentUser({...currentUser, subscriptionStatus: e.target.value as 'free' | 'premium' | 'lifetime'})}
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium (Annual)</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>
              
              {currentUser.subscriptionStatus === 'premium' && (
                <div className="space-y-2">
                  <Label htmlFor="expiry">Subscription Expiry Date</Label>
                  <Input
                    id="expiry"
                    type="date"
                    value={currentUser.subscriptionExpiry ? new Date(currentUser.subscriptionExpiry).toISOString().split('T')[0] : ''}
                    onChange={(e) => setCurrentUser({...currentUser, subscriptionExpiry: e.target.value})}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUserUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;