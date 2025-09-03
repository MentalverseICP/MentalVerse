import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/Separator';
import { Coins, Gift, Clock, CheckCircle, Droplets, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

import { authService } from '@/services/backend';
import { toast } from 'react-toastify';
import { useSidebar } from '@/components/ui/Sidebar';

interface FaucetClaim {
  id: string;
  amount: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

interface FaucetStats {
  dailyLimit: number;
  claimedToday: number;
  totalClaimed: number;
  nextClaimTime: number;
}

export default function TestnetFaucet() {
  const { userPrincipal, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<FaucetStats>({
    dailyLimit: 100,
    claimedToday: 0,
    totalClaimed: 0,
    nextClaimTime: 0
  });
  const [claims, setClaims] = useState<FaucetClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<string>('');
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    if (isAuthenticated && userPrincipal) {
      fetchFaucetData();
    }
  }, [isAuthenticated, userPrincipal]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateTimeUntilNextClaim();
    }, 1000);

    return () => clearInterval(interval);
  }, [stats.nextClaimTime]);

  const fetchFaucetData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const actor = authService.getActor();
      if (!actor) {
        throw new Error('Backend service not available');
      }
      
      // Fetch faucet stats and claim history
      const [faucetStats, claimHistory] = await Promise.all([
        actor.getFaucetStats(),
        actor.getFaucetClaimHistory()
      ]);
      
      if (faucetStats.Ok) {
        setStats(faucetStats.Ok);
      }
      setClaims(claimHistory);
      
    } catch (err) {
      setError('Failed to fetch faucet data');
      console.error('Faucet data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTimeUntilNextClaim = () => {
    if (stats.nextClaimTime <= Date.now()) {
      setTimeUntilNextClaim('');
      return;
    }

    const timeDiff = stats.nextClaimTime - Date.now();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    setTimeUntilNextClaim(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const handleClaim = async () => {
    if (claiming) return;

    try {
      setClaiming(true);
      setError(null);
      setSuccess(null);
      
      const actor = authService.getActor();
      if (!actor) {
        throw new Error('Backend service not available');
      }
      
      const result = await actor.claimFaucetTokens();
      
      if (result.Ok) {
        // Refresh wallet balance
        window.dispatchEvent(new CustomEvent('refreshTokenBalance'));
        
        toast.success(`Successfully claimed ${stats.dailyLimit} MVT tokens!`);
        await fetchFaucetData(); // Refresh data
      } else {
        const error = result.Err;
        toast.error(`Failed to claim tokens: ${error}`);
        throw new Error(error || 'Failed to claim tokens');
      }
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to claim tokens');
      if (err instanceof Error && !err.message.includes('Failed to claim tokens:')) {
        toast.error('Failed to claim tokens. Please try again.');
      }
    } finally {
      setClaiming(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClaimStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <div className="h-4 w-4 rounded-full bg-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className={cn(
        "min-h-screen w-full flex items-center justify-center transition-colors duration-500 px-2 py-8 sm:p-4 md:p-8 p-5 relative max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)] dark:bg-transparent",
        isCollapsed ? "md:w-[90vw]" : "md:w-[80vw]"
      )}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#18E614]"></div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen w-full flex items-center justify-center transition-colors duration-500 px-2 py-8 sm:p-4 md:p-8 p-5 relative max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)] dark:bg-transparent",
      isCollapsed ? "md:w-[90vw]" : "md:w-[80vw]"
    )}>
      <div className="w-full mx-auto p-4 sm:p-8 md:p-12 mt-4 flex flex-col gap-8 transition-all duration-300">
        {/* Header */}
        <div className="mb-2">
          <h1 className="font-extrabold text-2xl text-[#18E614] mb-2 flex items-center gap-2">
            <Droplets className="h-6 w-6" />
            Testnet Faucet
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Claim free MVT tokens daily for testing staking, transfers, and wallet functionalities on the testnet.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
            <Info className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700 dark:text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Faucet Card */}
        <Card className="border-[#18E614] dark:border-gray-800 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-r from-[#18E614]/20 to-[#6b9a41]/20 w-fit">
              <Gift className="h-8 w-8 text-[#18E614]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#18E614]">
              Daily Token Claim
            </CardTitle>
            <CardDescription>
              Claim your daily allocation of {stats.dailyLimit} MVT tokens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-gradient-to-r from-[#18E614]/10 to-[#6b9a41]/10 border border-[#18E614]/20">
                <Coins className="h-6 w-6 text-[#18E614] mx-auto mb-2" />
                <div className="text-2xl font-bold text-[#18E614]">{stats.dailyLimit}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Daily Limit</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                <CheckCircle className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-500">{stats.claimedToday}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Claimed Today</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20">
                <Gift className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-500">{stats.totalClaimed}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Claimed</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Progress</span>
                <span>{stats.claimedToday}/{stats.dailyLimit} MVT</span>
              </div>
              <Progress 
                value={(stats.claimedToday / stats.dailyLimit) * 100} 
                className="h-2"
              />
            </div>

            <Separator />

            {/* Claim Button */}
            <div className="text-center space-y-4">
              {stats.claimedToday >= stats.dailyLimit && timeUntilNextClaim && (
                <div className="flex items-center justify-center gap-2 text-orange-500">
                  <Clock className="h-4 w-4" />
                  <span>Next claim available in: {timeUntilNextClaim}</span>
                </div>
              )}
              
              <Button
                onClick={handleClaim}
                disabled={claiming || !isAuthenticated || stats.claimedToday >= stats.dailyLimit}
                className={cn(
                  "w-full py-6 text-lg font-bold rounded-xl transition-all duration-300",
                  stats.claimedToday < stats.dailyLimit && isAuthenticated
                    ? "bg-gradient-to-r from-[#6b9a41] to-[#18e614] hover:from-[#18e614] hover:to-[#109326] text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                )}
              >
                {claiming ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Claiming...
                  </div>
                ) : stats.claimedToday < stats.dailyLimit ? (
                  `Claim ${stats.dailyLimit} MVT Tokens`
                ) : (
                  "Daily limit reached"
                )}
              </Button>
              
              {!isAuthenticated && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please connect your wallet to claim tokens
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Claims */}
        {claims.length > 0 && (
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Claims
              </CardTitle>
              <CardDescription>
                Your recent faucet claim history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {claims.slice(0, 5).map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                      {getClaimStatusIcon(claim.status)}
                      <div>
                        <div className="font-medium">{claim.amount} MVT</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(claim.timestamp)}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={claim.status === 'completed' ? 'default' : claim.status === 'pending' ? 'secondary' : 'destructive'}
                      className={cn(
                        claim.status === 'completed' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                        claim.status === 'pending' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      )}
                    >
                      {claim.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}