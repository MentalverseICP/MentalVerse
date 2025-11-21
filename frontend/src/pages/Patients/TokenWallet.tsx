import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/Separator";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  Award,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/shared/theme-provider";
import {
  authService,
  TokenBalance,
  Transaction,
  EarningRecord,
  SpendingRecord,
} from "@/services/backend";
import { useSidebar } from "@/components/ui/Sidebar";
import { motion } from "framer-motion";

export default function TokenWallet() {
  const { userPrincipal, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [balance, setBalance] = useState<TokenBalance>({
    total: 0,
    available: 0,
    staked: 0,
    pending: 0,
    balance: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [spendings, setSpendings] = useState<SpendingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    if (isAuthenticated && userPrincipal) {
      fetchTokenData();
    }

    // Listen for balance refresh events from faucet
    const handleRefreshBalance = () => {
      fetchTokenData();
    };

    window.addEventListener("refreshTokenBalance", handleRefreshBalance);

    return () => {
      window.removeEventListener("refreshTokenBalance", handleRefreshBalance);
    };
  }, [isAuthenticated, userPrincipal]);

  const fetchTokenData = async () => {
    try {
      setLoading(true);
      setError(null);

      const actor = authService.getActor();
      if (!actor) {
        throw new Error("Backend service not available");
      }

      // Fetch token balance
      const balanceResult = await actor.getTokenBalance();
      if (balanceResult.Ok) {
        setBalance(balanceResult.Ok);
      } else {
        throw new Error(balanceResult.Err || "Failed to fetch balance");
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
      setError("Failed to fetch token data");
      console.error("Token data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earn":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "spend":
        return <ShoppingCart className="h-4 w-4 text-red-500" />;
      case "stake":
        return <Award className="h-4 w-4 text-blue-500" />;
      case "unstake":
        return <TrendingDown className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed:
        "text-white dark:text-white" +
        (theme === "dark" ? " bg-[#18E614]" : " bg-[#18E614]"),
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    return (
      <Badge
        className={cn("text-xs", variants[status as keyof typeof variants])}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Please log in to view your token wallet.
        </p>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "space-y-6 w-full min-h-screen transition-colors duration-500 px-2 py-8 sm:p-4 md:p-8 p-5 relative max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)]",
        isCollapsed ? "md:w-[90vw]" : "md:w-[80vw]"
      )}
    >
      {/* Balance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            title: "Total Balance",
            value: balance.total,
            icon: Wallet,
            color: "emerald",
            desc: "Your total token holdings",
          },
          {
            title: "Available",
            value: balance.available,
            icon: TrendingUp,
            color: "blue",
            desc: "Ready to use or transfer",
          },
          {
            title: "Staked",
            value: balance.staked,
            icon: Award,
            color: "purple",
            desc: "Earning rewards",
          },
          {
            title: "Pending",
            value: balance.pending,
            icon: Clock,
            color: "orange",
            desc: "Processing transactions",
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.05 }}
              className={`relative rounded-2xl overflow-hidden ${
                theme === "dark" ? "bg-[#0B0B0C]/60" : "bg-white/60"
              } backdrop-blur-xl border border-white/10 p-6 group`}
            >
              <div
                className={`absolute -top-40 -right-40 w-80 h-80 bg-${item.color}-500/10 rounded-full blur-3xl`}
              />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <p
                    className={`text-sm font-semibold ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {item.title}
                  </p>
                  <Icon className={`h-5 w-5 text-${item.color}-500`} />
                </div>
                <p className={`text-2xl font-bold mb-2 text-${item.color}-500`}>
                  {formatAmount(item.value)} MVT
                </p>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {item.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`relative rounded-3xl overflow-hidden ${
          theme === "dark" ? "bg-[#0B0B0C]/60" : "bg-white/60"
        } backdrop-blur-xl border border-white/10`}
      >
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative p-6 md:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-emerald-500" />
              <h3
                className={`font-bold text-lg ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Transaction History
              </h3>
            </div>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              View your recent token transactions and activities
            </p>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <TabsList
                className={`grid w-full grid-cols-4 ${
                  theme === "dark"
                    ? "bg-white/[0.02] border border-white/10"
                    : "bg-black/[0.02] border border-black/10"
                }`}
              >
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
                <TabsTrigger value="spendings">Spendings</TabsTrigger>
                <TabsTrigger value="staking">Staking</TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="all" className="space-y-4 mt-4">
              <ScrollArea
                className={`h-[400px] rounded-xl ${
                  theme === "dark"
                    ? "bg-white/[0.02] border border-white/10"
                    : "bg-black/[0.02] border border-black/10"
                } p-4`}
              >
                <div className="space-y-3">
                  {transactions.map((tx, index) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                          theme === "dark"
                            ? "hover:bg-white/[0.05]"
                            : "hover:bg-black/[0.05]"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(tx.type)}
                          <div>
                            <p
                              className={`font-medium ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {tx.description}
                            </p>
                            <p
                              className={`text-sm ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              {formatDate(tx.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={cn(
                              "font-bold",
                              tx.amount > 0
                                ? "text-emerald-500"
                                : "text-red-500"
                            )}
                          >
                            {tx.amount > 0 ? "+" : ""}
                            {formatAmount(tx.amount)} MVT
                          </span>
                          {getStatusBadge(tx.status)}
                        </div>
                      </div>
                      {index < transactions.length - 1 && (
                        <Separator
                          className={
                            theme === "dark" ? "bg-white/10" : "bg-black/10"
                          }
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="earnings" className="space-y-4 mt-4">
              <ScrollArea
                className={`h-[400px] rounded-xl ${
                  theme === "dark"
                    ? "bg-white/[0.02] border border-white/10"
                    : "bg-black/[0.02] border border-black/10"
                } p-4`}
              >
                <div className="space-y-3">
                  {earnings.map((earning, index) => (
                    <motion.div
                      key={earning.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + index * 0.05 }}
                    >
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                          theme === "dark"
                            ? "hover:bg-white/[0.05]"
                            : "hover:bg-black/[0.05]"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                          <div>
                            <p
                              className={`font-medium ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {earning.description}
                            </p>
                            <p
                              className={`text-sm ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              {formatDate(earning.timestamp)}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-500">
                          +{formatAmount(earning.amount)} MVT
                        </span>
                      </div>
                      {index < earnings.length - 1 && (
                        <Separator
                          className={
                            theme === "dark" ? "bg-white/10" : "bg-black/10"
                          }
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="spendings" className="space-y-4 mt-4">
              <ScrollArea
                className={`h-[400px] rounded-xl ${
                  theme === "dark"
                    ? "bg-white/[0.02] border border-white/10"
                    : "bg-black/[0.02] border border-black/10"
                } p-4`}
              >
                <div className="space-y-3">
                  {spendings.map((spending, index) => (
                    <motion.div
                      key={spending.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                    >
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                          theme === "dark"
                            ? "hover:bg-white/[0.05]"
                            : "hover:bg-black/[0.05]"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <ShoppingCart className="h-4 w-4 text-red-500" />
                          <div>
                            <p
                              className={`font-medium ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {spending.description}
                            </p>
                            <p
                              className={`text-sm ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              {formatDate(spending.timestamp)}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-red-500">
                          -{formatAmount(spending.amount)} MVT
                        </span>
                      </div>
                      {index < spendings.length - 1 && (
                        <Separator
                          className={
                            theme === "dark" ? "bg-white/10" : "bg-black/10"
                          }
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="staking" className="space-y-4 mt-4">
              <div
                className={`text-center py-8 rounded-xl ${
                  theme === "dark"
                    ? "bg-white/[0.02] border border-white/10"
                    : "bg-black/[0.02] border border-black/10"
                }`}
              >
                <Award
                  className={`h-12 w-12 mx-auto mb-4 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <p
                  className={
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }
                >
                  Staking transactions will appear here
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 px-4 py-2 bg-[#18E614]/40 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-[#18E614]/20 transition-all"
                >
                  View Staking Dashboard
                </motion.button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </motion.div>
  );
}
