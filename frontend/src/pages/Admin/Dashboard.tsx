import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, Coins, Settings, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/components/ui/Sidebar';

interface User {
  id: string;
  email: string;
  userType: 'patient' | 'therapist' | 'admin';
  isActive: boolean;
  lastLogin?: number;
}

interface TokenStats {
  totalSupply: number;
  totalAccounts: number;
  circulatingSupply: number;
}

interface SystemHealth {
  backend_status: 'active' | 'inactive' | 'error';
  mvt_token_status: 'active' | 'inactive' | 'error';
  last_health_check: number;
}

const AdminDashboard: React.FC = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { user, isAuthenticated } = useAuth();
  
  // Check if user is admin
  const userRole = localStorage.getItem('userRole') || user?.userType;
  
  // Redirect if not admin
  if (isAuthenticated && userRole !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. You must be an administrator to view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Show loading if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the admin dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [mintAmount, setMintAmount] = useState('500');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [customMintAmount, setCustomMintAmount] = useState('');

  // Check if user is admin
  const userIsAdmin = user?.userType === 'admin';

  useEffect(() => {
    if (isAuthenticated && userIsAdmin) {
      loadDashboardData();
    }
  }, [isAuthenticated, userIsAdmin]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadTokenStats(),
        loadSystemHealth()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      alert('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockUsers: User[] = [
        { id: '1', email: 'patient@example.com', userType: 'patient', isActive: true, lastLogin: Date.now() },
        { id: '2', email: 'therapist@example.com', userType: 'therapist', isActive: true, lastLogin: Date.now() },
        { id: '3', email: 'admin@example.com', userType: 'admin', isActive: true, lastLogin: Date.now() },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadTokenStats = async () => {
    try {
      // Mock data for now - replace with actual canister call
      const mockStats: TokenStats = {
        totalSupply: 1000000,
        totalAccounts: 150,
        circulatingSupply: 750000
      };
      setTokenStats(mockStats);
    } catch (error) {
      console.error('Error loading token stats:', error);
    }
  };

  const loadSystemHealth = async () => {
    try {
      // Mock data for now - replace with actual canister call
      const mockHealth: SystemHealth = {
        backend_status: 'active',
        mvt_token_status: 'active',
        last_health_check: Date.now()
      };
      setSystemHealth(mockHealth);
    } catch (error) {
      console.error('Error loading system health:', error);
    }
  };

  const handleMassDistribution = async () => {
    if (!mintAmount || isNaN(Number(mintAmount))) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // Convert MVT to base units (assuming 8 decimals)
      // const baseAmount = Number(mintAmount) * Math.pow(10, 8);
      
      // Call the backend canister's massDistributeTokens function
      // const result = await backendCanister.massDistributeTokens(baseAmount);
      
      // Mock success for now
      alert(`Successfully distributed ${mintAmount} MVT to all users`);
      await loadTokenStats(); // Refresh stats
    } catch (error) {
      console.error('Error distributing tokens:', error);
      alert('Failed to distribute tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomMint = async () => {
    if (!selectedUser || !customMintAmount || isNaN(Number(customMintAmount))) {
      alert('Please select a user and enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // Convert MVT to base units
      // const baseAmount = Number(customMintAmount) * Math.pow(10, 8);
      
      // Call the token canister's mint_tokens function
      // const result = await tokenCanister.mint_tokens(selectedUser, baseAmount);
      
      // Mock success for now
      alert(`Successfully minted ${customMintAmount} MVT to user`);
      await loadTokenStats(); // Refresh stats
    } catch (error) {
      console.error('Error minting tokens:', error);
      alert('Failed to mint tokens');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Inactive</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Please log in to access the admin dashboard.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!userIsAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Access denied. Admin privileges required.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`container mx-auto p-6 space-y-6 max-xs:ml-[4.5rem] max-md:ml-20 mt-4 mb-4 mr-2 ${isCollapsed ? 'gap-5 w-fit md:pr-4 md:pl-2' : 'xl:gap-5 gap-5'}`}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={loadDashboardData} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Activity className="w-4 h-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backend Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {systemHealth ? getStatusBadge(systemHealth.backend_status) : <Badge variant="secondary">Loading...</Badge>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Canister</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {systemHealth ? getStatusBadge(systemHealth.mvt_token_status) : <Badge variant="secondary">Loading...</Badge>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Token Statistics */}
      {tokenStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Supply</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tokenStats.totalSupply.toLocaleString()} MVT</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tokenStats.totalAccounts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Circulating Supply</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tokenStats.circulatingSupply.toLocaleString()} MVT</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Actions */}
      <Tabs defaultValue="token-management" className="space-y-4">
        <TabsList>
          <TabsTrigger value="token-management">Token Management</TabsTrigger>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
          <TabsTrigger value="system-settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="token-management" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mass Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Mass Token Distribution</CardTitle>
                <CardDescription>
                  Distribute tokens to all registered users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mint-amount">Amount per user (MVT)</Label>
                  <Input
                    id="mint-amount"
                    type="number"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <Button 
                  onClick={handleMassDistribution} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Coins className="w-4 h-4 mr-2" />}
                  Distribute to All Users
                </Button>
              </CardContent>
            </Card>

            {/* Custom Mint */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Token Mint</CardTitle>
                <CardDescription>
                  Mint tokens to a specific user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-select">Select User</Label>
                  <select
                    id="user-select"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select a user...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.email} ({user.userType})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-amount">Amount (MVT)</Label>
                  <Input
                    id="custom-amount"
                    type="number"
                    value={customMintAmount}
                    onChange={(e) => setCustomMintAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <Button 
                  onClick={handleCustomMint} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Coins className="w-4 h-4 mr-2" />}
                  Mint Tokens
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{user.email}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.userType === 'admin' ? 'default' : 'secondary'}>
                          {user.userType}
                        </Badge>
                        <Badge variant={user.isActive ? 'default' : 'destructive'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system parameters and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Update Canister Settings
                </Button>
                <Button variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  System Health Check
                </Button>
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Export User Data
                </Button>
                <Button variant="outline">
                  <Coins className="w-4 h-4 mr-2" />
                  Token Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;