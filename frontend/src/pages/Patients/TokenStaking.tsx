import { useState, useEffect } from "react";
import {
  Award,
  TrendingUp,
  Lock,
  Unlock,
  Calculator,
  Info,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/shared/theme-provider";
import { authService } from "@/services/backend";
import { useSidebar } from "@/components/ui/Sidebar";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface StakePosition {
  id: string;
  amount: number;
  lockPeriod: number; // in days
  apy: number;
  stakedAt: number;
  unlocksAt: number;
  rewards: number;
  status: "active" | "unlocked" | "withdrawn";
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
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedPool, setSelectedPool] = useState<string>("");
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
      participants: 245,
    },
    {
      lockPeriod: 90,
      apy: 8.0,
      minStake: 250,
      totalStaked: 350000,
      participants: 189,
    },
    {
      lockPeriod: 180,
      apy: 12.0,
      minStake: 500,
      totalStaked: 750000,
      participants: 156,
    },
    {
      lockPeriod: 365,
      apy: 18.0,
      minStake: 1000,
      totalStaked: 1200000,
      participants: 98,
    },
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
        authService.getUserStake(),
      ]);

      setBalance(balanceData.Ok?.available || 0);

      // Convert StakeInfo to StakePosition format
      const stakePositions: StakePosition[] = stakeData
        ? [
            {
              id: "1",
              amount: stakeData.amount,
              lockPeriod: Math.floor(
                (stakeData.unlockTime - stakeData.stakeTime) /
                  (24 * 60 * 60 * 1000)
              ),
              apy: 8.0, // Default APY, could be part of StakeInfo
              stakedAt: stakeData.stakeTime,
              unlocksAt: stakeData.unlockTime,
              rewards: stakeData.rewards,
              status: Date.now() > stakeData.unlockTime ? "unlocked" : "active",
            },
          ]
        : [];

      setPositions(stakePositions);
    } catch (err) {
      setError("Failed to fetch staking data");
      console.error("Staking data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateRewards = (amount: number, apy: number, days: number) => {
    return amount * (apy / 100) * (days / 365);
  };

  const getSelectedPoolData = () => {
    return stakingPools.find(
      (pool) => pool.lockPeriod.toString() === selectedPool
    );
  };

  const handleStake = async () => {
    if (!stakeAmount || !selectedPool) {
      setError("Please enter amount and select a staking pool");
      return;
    }

    const amount = parseFloat(stakeAmount);
    const poolData = getSelectedPoolData();

    if (!poolData) {
      setError("Invalid staking pool selected");
      return;
    }

    if (amount < poolData.minStake) {
      setError(`Minimum stake amount is ${poolData.minStake} MVT`);
      return;
    }

    if (amount > balance) {
      setError("Insufficient balance");
      return;
    }

    try {
      setStaking(true);
      setError(null);

      // Call actual staking API
      await authService.stakeTokens(amount, poolData.lockPeriod);

      // Refresh staking data after successful stake
      await fetchStakingData();

      setStakeAmount("");
      setSelectedPool("");
    } catch (err) {
      setError("Failed to stake tokens");
      console.error("Staking error:", err);
    } finally {
      setStaking(false);
    }
  };

  const handleUnstake = async (positionId: string) => {
    try {
      setError(null);

      // Find the position to get the amount
      const position = positions.find((p) => p.id === positionId);
      if (!position) {
        throw new Error("Position not found");
      }

      // Call actual unstaking API with amount
      await authService.unstakeTokens(position.amount);

      // Refresh staking data after successful unstake
      await fetchStakingData();
    } catch (err) {
      setError("Failed to unstake tokens");
      console.error("Unstaking error:", err);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
        <p className="text-muted-foreground">
          Please log in to access staking features.
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
      {/* Staking Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          {
            title: "Available Balance",
            value: balance,
            icon: Award,
            color: "emerald",
            desc: "Ready to stake",
          },
          {
            title: "Total Staked",
            value: positions
              .filter((p) => p.status === "active")
              .reduce((sum, p) => sum + p.amount, 0),
            icon: Lock,
            color: "blue",
            desc: "Earning rewards",
          },
          {
            title: "Total Rewards",
            value: positions.reduce((sum, p) => sum + p.rewards, 0),
            icon: TrendingUp,
            color: "emerald",
            desc: "Accumulated earnings",
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
              } backdrop-blur-xl border border-white/10 p-6`}
            >
              <div
                className={`absolute -top-40 -right-40 w-80 h-80 bg-${item.color}-500/10 rounded-full blur-3xl`}
              />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {item.title}
                  </p>
                  <p
                    className={`text-2xl font-bold text-${item.color}-500 mt-1`}
                  >
                    {formatAmount(item.value)} MVT
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
                <Icon className={`h-8 w-8 text-${item.color}-500 opacity-20`} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-4 border ${
            theme === "dark"
              ? "bg-red-500/10 border-red-500/30"
              : "bg-red-100 border-red-200"
          }`}
        >
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className={theme === "dark" ? "text-red-400" : "text-red-600"}>
              {error}
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staking Pools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`relative rounded-3xl overflow-hidden ${
            theme === "dark" ? "bg-[#0B0B0C]/60" : "bg-white/60"
          } backdrop-blur-xl border border-white/10`}
        >
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#18E614]/10 rounded-full blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="relative p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Award className="h-5 w-5 text-[#12B80E]" />
              <h2
                className={`font-bold text-lg ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Stake Tokens
              </h2>
            </div>
            <p
              className={`text-sm mb-6 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Choose a staking pool and earn rewards
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  className={`text-sm font-semibold ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Amount to Stake
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className={`rounded-xl px-4 py-2.5 text-sm text-right transition-colors ${
                    theme === "dark"
                      ? "bg-white/[0.02] border border-white/10 text-white placeholder-gray-500 focus:border-[#18E614]/50"
                      : "bg-black/[0.02] border border-black/10 text-gray-900 placeholder-gray-600 focus:border-[#12B80E]/50"
                  }`}
                />
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Available: {formatAmount(balance)} MVT
                </p>
              </div>

              <div className="space-y-2">
                <label
                  className={`text-sm font-semibold ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Staking Pool
                </label>
                <Select value={selectedPool} onValueChange={setSelectedPool}>
                  <SelectTrigger
                    className={`rounded-xl ${
                      theme === "dark"
                        ? "bg-white/[0.02] border border-white/10 text-white"
                        : "bg-black/[0.02] border border-black/10 text-gray-900"
                    }`}
                  >
                    <SelectValue placeholder="Select staking period" />
                  </SelectTrigger>
                  <SelectContent>
                    {stakingPools.map((pool) => (
                      <SelectItem
                        key={pool.lockPeriod}
                        value={pool.lockPeriod.toString()}
                      >
                        {pool.lockPeriod} days - {pool.apy}% APY
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPool && stakeAmount && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border ${
                    theme === "dark"
                      ? "bg-white/[0.02] border-white/10"
                      : "bg-black/[0.02] border-black/10"
                  } space-y-2`}
                >
                  <div
                    className={`flex justify-between text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <span>Estimated Annual Rewards:</span>
                    <span className="font-medium text-[#12B80E]">
                      {formatAmount(
                        calculateRewards(
                          parseFloat(stakeAmount),
                          getSelectedPoolData()?.apy || 0,
                          365
                        )
                      )}{" "}
                      MVT
                    </span>
                  </div>
                  <div
                    className={`flex justify-between text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <span>Lock Period:</span>
                    <span className="font-medium">{selectedPool} days</span>
                  </div>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStake}
                disabled={!stakeAmount || !selectedPool || staking}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  !stakeAmount || !selectedPool || staking
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-[#18E614]/40 text-white hover:shadow-lg hover:shadow-[#18E614]/20"
                }`}
              >
                {staking ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Staking...
                  </div>
                ) : (
                  "Stake Tokens"
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Staking Pools Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`relative rounded-3xl overflow-hidden ${
            theme === "dark" ? "bg-[#0B0B0C]/60" : "bg-white/60"
          } backdrop-blur-xl border border-white/10`}
        >
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="relative p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="h-5 w-5 text-blue-500" />
              <h2
                className={`font-bold text-lg ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Staking Pools
              </h2>
            </div>
            <p
              className={`text-sm mb-6 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Available staking options and their rewards
            </p>

            <div className="space-y-3">
              {stakingPools.map((pool, idx) => (
                <motion.div
                  key={pool.lockPeriod}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + idx * 0.05 }}
                  className={`p-4 rounded-xl border ${
                    theme === "dark"
                      ? "bg-white/[0.02] border-white/10"
                      : "bg-black/[0.02] border-black/10"
                  } space-y-2`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p
                        className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {pool.lockPeriod} Days
                      </p>
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Min: {formatAmount(pool.minStake)} MVT
                      </p>
                    </div>
                    <span className="bg-[#18E614]/40 text-white px-3 py-1 rounded-full font-bold text-sm">
                      {pool.apy}% APY
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        Total Staked
                      </p>
                      <p
                        className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatAmount(pool.totalStaked)} MVT
                      </p>
                    </div>
                    <div>
                      <p
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        Participants
                      </p>
                      <p
                        className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {pool.participants}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Active Positions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={`relative rounded-3xl overflow-hidden ${
          theme === "dark" ? "bg-[#0B0B0C]/60" : "bg-white/60"
        } backdrop-blur-xl border border-white/10`}
      >
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="h-5 w-5 text-[#12B80E]" />
            <h2
              className={`font-bold text-lg ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Your Staking Positions
            </h2>
          </div>
          <p
            className={`text-sm mb-6 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Manage your active and completed stakes
          </p>

          {positions.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 opacity-20 mx-auto mb-4" />
              <p
                className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
              >
                No staking positions yet
              </p>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-500" : "text-gray-600"
                }`}
              >
                Start staking to earn rewards
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {positions.map((position, idx) => (
                <motion.div
                  key={position.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  className={`p-4 rounded-xl border ${
                    theme === "dark"
                      ? "border-white/10 hover:bg-white/[0.02]"
                      : "border-black/10 hover:bg-black/[0.02]"
                  } transition-colors space-y-3`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p
                        className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatAmount(position.amount)} MVT
                      </p>
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {position.lockPeriod} days • {position.apy}% APY
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        position.status === "active"
                          ? theme === "dark"
                            ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                            : "bg-blue-100 border-blue-300 text-blue-700"
                          : position.status === "unlocked"
                          ? theme === "dark"
                            ? "bg-[#18E614]/20 border-[#18E614]/30 text-[#12B80E]"
                            : "bg-[#18E614]/10 border-[#18E614]/20 text-[#12B80E]"
                          : theme === "dark"
                          ? "bg-gray-500/20 border-gray-500/30 text-gray-400"
                          : "bg-gray-100 border-gray-300 text-gray-700"
                      }`}
                    >
                      {position.status.charAt(0).toUpperCase() +
                        position.status.slice(1)}
                    </span>
                  </div>

                  {position.status === "active" && (
                    <div className="space-y-2">
                      <div
                        className={`flex justify-between text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        <span>Progress</span>
                        <span>
                          {getDaysRemaining(position.unlocksAt)} days remaining
                        </span>
                      </div>
                      <div
                        className={`h-2 rounded-full overflow-hidden ${
                          theme === "dark" ? "bg-white/10" : "bg-black/10"
                        }`}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${getProgressPercentage(
                              position.stakedAt,
                              position.unlocksAt
                            )}%`,
                          }}
                          transition={{ duration: 1 }}
                          className="h-full bg-[#18E614]/60"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        Staked Date
                      </p>
                      <p
                        className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatDate(position.stakedAt)}
                      </p>
                    </div>
                    <div>
                      <p
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        Unlock Date
                      </p>
                      <p
                        className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatDate(position.unlocksAt)}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex justify-between items-center pt-3 border-t ${
                      theme === "dark" ? "border-white/10" : "border-black/10"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Rewards Earned
                      </p>
                      <p className="font-medium text-[#18E614]">
                        {formatAmount(position.rewards)} MVT
                      </p>
                    </div>
                    {position.status === "unlocked" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUnstake(position.id)}
                        className="px-4 py-2 bg-[#18E614]/40 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-[#18E614]/20 transition-all flex items-center gap-2"
                      >
                        <Unlock className="h-4 w-4" />
                        Withdraw
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
