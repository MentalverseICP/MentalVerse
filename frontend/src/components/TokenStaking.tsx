import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Award, TrendingUp, Lock, Unlock, Calculator, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { authService } from '@/services/backend';
import { useSidebar } from './ui/Sidebar';

interface StakePosition {
  id: string;
  amount: number;
  lockPeriod: number; // in days
  apy: number;
  stakedAt: number;
  unlocksAt: number;
  rewards: number;
  status: 'active' | 'unlocked' | 'withdrawn';
}

interface StakingPool {
  lockPeriod: number;
  apy: number;
  minStake: number;
  totalStaked: number;
  participants: number;
}

export default function TokenStaking() {
  const { userPrincipal, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [balance, setBalance] = useState(0);
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPool, setSelectedPool] = useState<string>('');
  const [positions, setPositions] = useState<StakePosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [staking, setStaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const stakingPools: StakingPool[] = [
    {
      lockPeriod: 30,
      apy: 5.0,
      minStake: 100,
      totalStaked: 125000,
      participants: 245
    },
    {
      lockPeriod: 90,
      apy: 8.0,
      minStake: 250,
      totalStaked: 350000,
      participants: 189
    },
    {
      lockPeriod: 180,
      apy: 12.0,
      minStake: 500,
      totalStaked: 750000,
      participants: 156
    },
    {
      lockPeriod: 365,
      apy: 18.0,
      minStake: 1000,
      totalStaked: 1200000,
      participants: 98
    }
  ];

  useEffect(() => {
    if (isAuthenticated && userPrincipal) {
      fetchStakingData();
    }
  }, [isAuthenticated, userPrincipal]);

  const fetchStakingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch actual data from backend
      const [balanceData, stakeData] = await Promise.all([
        authService.getTokenBalance(),
        authService.getUserStake()
      ]);
      
      setBalance(balanceData.balance);
      
      // Convert StakeInfo to StakePosition format
      const stakePositions: StakePosition[] = stakeData ? [{
        id: '1',
        amount: stakeData.amount,
        lockPeriod: Math.floor((stakeData.unlockTime - stakeData.stakeTime) / (24 * 60 * 60 * 1000)),
        apy: 8.0, // Default APY, could be part of StakeInfo
        stakedAt: stakeData.stakeTime,
        unlocksAt: stakeData.unlockTime,
        rewards: stakeData.rewards,
        status: Date.now() > stakeData.unlockTime ? 'unlocked' : 'active'
      }] : [];
      
      setPositions(stakePositions);
      
    } catch (err) {
      setError('Failed to fetch staking data');
      console.error('Staking data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateRewards = (amount: number, apy: number, days: number) => {
    return (amount * (apy / 100) * (days / 365));
  };

  const getSelectedPoolData = () => {
    return stakingPools.find(pool => pool.lockPeriod.toString() === selectedPool);
  };

  const handleStake = async () => {
    if (!stakeAmount || !selectedPool) {
      setError('Please enter amount and select a staking pool');
      return;
    }

    const amount = parseFloat(stakeAmount);
    const poolData = getSelectedPoolData();
    
    if (!poolData) {
      setError('Invalid staking pool selected');
      return;
    }

    if (amount < poolData.minStake) {
      setError(`Minimum stake amount is ${poolData.minStake} MVT`);
      return;
    }

    if (amount > balance) {
      setError('Insufficient balance');
      return;
    }

    try {
      setStaking(true);
      setError(null);
      
      // Call actual staking API
      await authService.stakeTokens(amount, poolData.lockPeriod);
      
      // Refresh staking data after successful stake
      await fetchStakingData();
      
      setStakeAmount('');
      setSelectedPool('');
      
    } catch (err) {
      setError('Failed to stake tokens');
      console.error('Staking error:', err);
    } finally {
      setStaking(false);
    }
  };

  const handleUnstake = async (positionId: string) => {
    try {
      setError(null);
      
      // Find the position to get the amount
      const position = positions.find(p => p.id === positionId);
      if (!position) {
        throw new Error('Position not found');
      }
      
      // Call actual unstaking API with amount
      await authService.unstakeTokens(position.amount);
      
      // Refresh staking data after successful unstake
      await fetchStakingData();
      
    } catch (err) {
      setError('Failed to unstake tokens');
      console.error('Unstaking error:', err);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (unlocksAt: number) => {
    const now = Date.now();
    const diff = unlocksAt - now;
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  };

  const getProgressPercentage = (stakedAt: number, unlocksAt: number) => {
    const now = Date.now();
    const total = unlocksAt - stakedAt;
    const elapsed = now - stakedAt;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to access staking features.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#18E614]"></div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 min-h-screen w-full transition-colors duration-500 px-2 py-8 sm:p-4 md:p-8 p-5 relative max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)] dark:bg-transparent", isCollapsed ? "md:w-[90vw]" : "md:w-[80vw]"
)   }>      {/* Staking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={cn('border-2', theme === 'dark' ? 'bg-[#0B0B0C] border-[#2f3339]' : 'bg-white border-gray-200')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Award className="h-4 w-4 text-[#18E614]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#18E614]">{formatAmount(balance)} MVT</div>
            <p className="text-xs text-muted-foreground">Ready to stake</p>
          </CardContent>
        </Card>
        
        <Card className={cn('border-2', theme === 'dark' ? 'bg-[#0B0B0C] border-[#2f3339]' : 'bg-white border-gray-200')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
            <Lock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(positions.filter(p => p.status === 'active').reduce((sum, p) => sum + p.amount, 0))} MVT
            </div>
            <p className="text-xs text-muted-foreground">Earning rewards</p>
          </CardContent>
        </Card>
        
        <Card className={cn('border-2', theme === 'dark' ? 'bg-[#0B0B0C] border-[#2f3339]' : 'bg-white border-gray-200')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatAmount(positions.reduce((sum, p) => sum + p.rewards, 0))} MVT
            </div>
            <p className="text-xs text-muted-foreground">Accumulated earnings</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staking Pools */}
        <Card className={cn('border-2', theme === 'dark' ? 'bg-[#0B0B0C] border-[#2f3339]' : 'bg-white border-gray-200')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Stake Tokens
            </CardTitle>
            <CardDescription>
              Choose a staking pool and earn rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Stake</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">
                Available: {formatAmount(balance)} MVT
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pool">Staking Pool</Label>
              <Select value={selectedPool} onValueChange={setSelectedPool}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staking period" />
                </SelectTrigger>
                <SelectContent>
                  {stakingPools.map((pool) => (
                    <SelectItem key={pool.lockPeriod} value={pool.lockPeriod.toString()}>
                      {pool.lockPeriod} days - {pool.apy}% APY
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedPool && stakeAmount && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Estimated Annual Rewards:</span>
                  <span className="font-medium text-green-500">
                    {formatAmount(calculateRewards(parseFloat(stakeAmount), getSelectedPoolData()?.apy || 0, 365))} MVT
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Lock Period:</span>
                  <span className="font-medium">{selectedPool} days</span>
                </div>
              </div>
            )}
            
            <Button 
              onClick={handleStake} 
              disabled={!stakeAmount || !selectedPool || staking}
              className="w-full bg-[#18E614] hover:bg-[#15CC11] text-black"
            >
              {staking ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  Staking...
                </div>
              ) : (
                'Stake Tokens'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Staking Pools Info */}
        <Card className={cn('border-2', theme === 'dark' ? 'bg-[#0B0B0C] border-[#2f3339]' : 'bg-white border-gray-200')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Staking Pools
            </CardTitle>
            <CardDescription>
              Available staking options and their rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stakingPools.map((pool) => (
                <div key={pool.lockPeriod} className="p-3 border rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{pool.lockPeriod} Days</p>
                      <p className="text-sm text-muted-foreground">
                        Min: {formatAmount(pool.minStake)} MVT
                      </p>
                    </div>
                    <Badge className="bg-[#18E614] text-black hover:bg-[#15CC11]">
                      {pool.apy}% APY
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>
                      <p>Total Staked</p>
                      <p className="font-medium text-foreground">
                        {formatAmount(pool.totalStaked)} MVT
                      </p>
                    </div>
                    <div>
                      <p>Participants</p>
                      <p className="font-medium text-foreground">{pool.participants}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Positions */}
      <Card className={cn('border-2', theme === 'dark' ? 'bg-[#0B0B0C] border-[#2f3339]' : 'bg-white border-gray-200')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Your Staking Positions
          </CardTitle>
          <CardDescription>
            Manage your active and completed stakes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No staking positions yet</p>
              <p className="text-sm text-muted-foreground">Start staking to earn rewards</p>
            </div>
          ) : (
            <div className="space-y-4">
              {positions.map((position) => (
                <div key={position.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{formatAmount(position.amount)} MVT</p>
                      <p className="text-sm text-muted-foreground">
                        {position.lockPeriod} days • {position.apy}% APY
                      </p>
                    </div>
                    <Badge 
                      className={cn(
                        position.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        position.status === 'unlocked' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                      )}
                    >
                      {position.status.charAt(0).toUpperCase() + position.status.slice(1)}
                    </Badge>
                  </div>
                  
                  {position.status === 'active' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{getDaysRemaining(position.unlocksAt)} days remaining</span>
                      </div>
                      <Progress value={getProgressPercentage(position.stakedAt, position.unlocksAt)} className="h-2" />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Staked Date</p>
                      <p className="font-medium">{formatDate(position.stakedAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Unlock Date</p>
                      <p className="font-medium">{formatDate(position.unlocksAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Rewards Earned</p>
                      <p className="font-medium text-green-500">{formatAmount(position.rewards)} MVT</p>
                    </div>
                    {position.status === 'unlocked' && (
                      <Button 
                        onClick={() => handleUnstake(position.id)}
                        size="sm"
                        className="bg-[#18E614] hover:bg-[#15CC11] text-black"
                      >
                        <Unlock className="h-4 w-4 mr-1" />
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}