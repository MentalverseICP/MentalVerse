import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/Separator';
import { Wallet, TrendingUp, TrendingDown, Clock, Award, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { authService, TokenBalance, Transaction, EarningRecord, SpendingRecord } from '@/services/backend';

export default function TokenWallet() {
  const { userPrincipal, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [balance, setBalance] = useState<TokenBalance>({
    total: 0,
    available: 0,
    staked: 0,
    pending: 0,
    balance: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [spendings, setSpendings] = useState<SpendingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && userPrincipal) {
      fetchTokenData();
    }
  }, [isAuthenticated, userPrincipal]);

  const fetchTokenData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const actor = authService.getActor();
      if (!actor) {
        throw new Error('Backend service not available');
      }
      
      // Fetch token balance
      const balanceResult = await actor.getTokenBalance();
      if (balanceResult.Ok) {
        setBalance(balanceResult.Ok);
      } else {
        throw new Error(balanceResult.Err || 'Failed to fetch balance');
      }
      
      // Fetch transaction history
      const transactionHistory = await actor.getTransactionHistory(0, 50);
      setTransactions(transactionHistory);
      
      // Fetch earning history
      const earningHistory = await actor.getUserEarningHistory();
      setEarnings(earningHistory);
      
      // Fetch spending history
      const spendingHistory = await actor.getUserSpendingHistory();
      setSpendings(spendingHistory);
      
    } catch (err) {
      setError('Failed to fetch token data');
      console.error('Token data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'spend': return <ShoppingCart className="h-4 w-4 text-red-500" />;
      case 'stake': return <Award className="h-4 w-4 text-blue-500" />;
      case 'unstake': return <TrendingDown className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    
    return (
      <Badge className={cn('text-xs', variants[status as keyof typeof variants])}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view your token wallet.</p>
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchTokenData} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cn('border-2', theme === 'dark' ? 'bg-[#0B0B0C] border-[#2f3339]' : 'bg-white border-gray-200')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-[#18E614]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#18E614]">{formatAmount(balance.total)} MVT</div>
            <p className="text-xs text-muted-foreground">Your total token holdings</p>
          </CardContent>
        </Card>
        
        <Card className={cn('border-2', theme === 'dark' ? 'bg-[#0B0B0C] border-[#2f3339]' : 'bg-white border-gray-200')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(balance.available)} MVT</div>
            <p className="text-xs text-muted-foreground">Ready to use or transfer</p>
          </CardContent>
        </Card>
        
        <Card className={cn('border-2', theme === 'dark' ? 'bg-[#0B0B0C] border-[#2f3339]' : 'bg-white border-gray-200')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staked</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(balance.staked)} MVT</div>
            <p className="text-xs text-muted-foreground">Earning rewards</p>
          </CardContent>
        </Card>
        
        <Card className={cn('border-2', theme === 'dark' ? 'bg-[#0B0B0C] border-[#2f3339]' : 'bg-white border-gray-200')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(balance.pending)} MVT</div>
            <p className="text-xs text-muted-foreground">Processing transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className={cn('border-2', theme === 'dark' ? 'bg-[#0B0B0C] border-[#2f3339]' : 'bg-white border-gray-200')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            View your recent token transactions and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="spendings">Spendings</TabsTrigger>
              <TabsTrigger value="staking">Staking</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {transactions.map((tx, index) => (
                    <div key={tx.id}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(tx.type)}
                          <div>
                            <p className="font-medium">{tx.description}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(tx.timestamp)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={cn(
                            'font-bold',
                            tx.amount > 0 ? 'text-green-500' : 'text-red-500'
                          )}>
                            {tx.amount > 0 ? '+' : ''}{formatAmount(tx.amount)} MVT
                          </span>
                          {getStatusBadge(tx.status)}
                        </div>
                      </div>
                      {index < transactions.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="earnings" className="space-y-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {earnings.map((earning, index) => (
                    <div key={earning.id}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="font-medium">{earning.description}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(earning.timestamp)}</p>
                          </div>
                        </div>
                        <span className="font-bold text-green-500">
                          +{formatAmount(earning.amount)} MVT
                        </span>
                      </div>
                      {index < earnings.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="spendings" className="space-y-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {spendings.map((spending, index) => (
                    <div key={spending.id}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <ShoppingCart className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="font-medium">{spending.description}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(spending.timestamp)}</p>
                          </div>
                        </div>
                        <span className="font-bold text-red-500">
                          -{formatAmount(spending.amount)} MVT
                        </span>
                      </div>
                      {index < spendings.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="staking" className="space-y-4">
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Staking transactions will appear here</p>
                <Button className="mt-4" variant="outline">
                  View Staking Dashboard
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}