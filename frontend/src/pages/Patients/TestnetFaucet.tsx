import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/Separator";
import { Coins, Gift, Clock, CheckCircle, Droplets, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/shared/theme-provider";
import { authService } from "@/services/backend";
import { toast } from "react-toastify";
import { useSidebar } from "@/components/ui/Sidebar";
import { motion } from "framer-motion";

interface FaucetClaim {
  id: string;
  amount: number;
  timestamp: number;
  status: "pending" | "completed" | "failed";
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
    nextClaimTime: 0,
  });
  const [claims, setClaims] = useState<FaucetClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<string>("");
  const { state } = useSidebar();
  const { theme } = useTheme();
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
        throw new Error("Backend service not available");
      }

      // Fetch faucet stats and claim history
      const [faucetStats, claimHistory] = await Promise.all([
        actor.getFaucetStats(),
        actor.getFaucetClaimHistory(),
      ]);

      if (faucetStats.Ok) {
        setStats(faucetStats.Ok);
      }
      setClaims(claimHistory);
    } catch (err) {
      setError("Failed to fetch faucet data");
      console.error("Faucet data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateTimeUntilNextClaim = () => {
    if (stats.nextClaimTime <= Date.now()) {
      setTimeUntilNextClaim("");
      return;
    }

    const timeDiff = stats.nextClaimTime - Date.now();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    setTimeUntilNextClaim(
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    );
  };

  const handleClaim = async () => {
    if (claiming) return;

    try {
      setClaiming(true);
      setError(null);
      setSuccess(null);

      const actor = authService.getActor();
      if (!actor) {
        throw new Error("Backend service not available");
      }

      const result = await actor.claimFaucetTokens();

      if (result.Ok) {
        // Refresh wallet balance
        window.dispatchEvent(new CustomEvent("refreshTokenBalance"));

        toast.success(`Successfully claimed ${stats.dailyLimit} MVT tokens!`);
        await fetchFaucetData(); // Refresh data
      } else {
        const error = result.Err;
        toast.error(`Failed to claim tokens: ${error}`);
        throw new Error(error || "Failed to claim tokens");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to claim tokens");
      if (
        err instanceof Error &&
        !err.message.includes("Failed to claim tokens:")
      ) {
        toast.error("Failed to claim tokens. Please try again.");
      }
    } finally {
      setClaiming(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getClaimStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <div className="h-4 w-4 rounded-full bg-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "w-full min-h-screen flex items-center justify-center transition-colors duration-500 px-2 py-8 sm:p-4 md:p-8 p-5 relative max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)]",
          isCollapsed ? "md:w-[90vw]" : "md:w-[80vw]"
        )}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "w-full min-h-screen flex items-center justify-center transition-colors duration-500 px-2 py-8 sm:p-4 md:p-8 p-5 relative max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)]",
        isCollapsed ? "md:w-[90vw]" : "md:w-[80vw]"
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full mx-auto p-4 sm:p-8 md:p-12 flex flex-col gap-8 transition-all duration-300"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-2"
        >
          <h1
            className={`font-bold text-3xl sm:text-4xl mb-2 flex items-center gap-3 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            <Droplets className="h-8 w-8 text-emerald-500" />
            Testnet Faucet
          </h1>
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Claim free MVT tokens daily for testing staking, transfers, and
            wallet functionalities on the testnet.
          </p>
        </motion.div>

        {/* Alerts */}
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

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 border ${
              theme === "dark"
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-emerald-100 border-emerald-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <p
                className={
                  theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                }
              >
                {success}
              </p>
            </div>
          </motion.div>
        )}

        {/* Main Faucet Card */}
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

          <div className="relative p-6 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-r from-[#18E614]/15 to-[#18E614]/10 w-fit"
              >
                <Gift className="h-8 w-8 text-emerald-500" />
              </motion.div>
              <h2
                className={`text-2xl font-bold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Daily Token Claim
              </h2>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Claim your daily allocation of {stats.dailyLimit} MVT tokens
              </p>
            </div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
              {[
                {
                  icon: Coins,
                  label: "Daily Limit",
                  value: stats.dailyLimit,
                  color: "emerald",
                },
                {
                  icon: CheckCircle,
                  label: "Claimed Today",
                  value: stats.claimedToday,
                  color: "blue",
                },
                {
                  icon: Gift,
                  label: "Total Claimed",
                  value: stats.totalClaimed,
                  color: "purple",
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.05 }}
                    className={`text-center p-4 rounded-xl border ${
                      theme === "dark"
                        ? "bg-white/[0.02] border-white/10"
                        : "bg-black/[0.02] border-black/10"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 text-${item.color}-500 mx-auto mb-2`}
                    />
                    <div
                      className={`text-2xl font-bold text-${item.color}-500`}
                    >
                      {item.value}
                    </div>
                    <div
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {item.label}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-2 mb-6"
            >
              <div
                className={`flex justify-between text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <span>Daily Progress</span>
                <span>
                  {stats.claimedToday}/{stats.dailyLimit} MVT
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
                    width: `${(stats.claimedToday / stats.dailyLimit) * 100}%`,
                  }}
                  transition={{ duration: 1 }}
                  className="h-full bg-[#18E614]/60"
                />
              </div>
            </motion.div>

            <div
              className={`h-px ${
                theme === "dark" ? "bg-white/10" : "bg-black/10"
              } mb-6`}
            />

            {/* Claim Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-center space-y-4"
            >
              {stats.claimedToday >= stats.dailyLimit && timeUntilNextClaim && (
                <div className="flex items-center justify-center gap-2 text-orange-500">
                  <Clock className="h-4 w-4" />
                  <span>Next claim available in: {timeUntilNextClaim}</span>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClaim}
                disabled={
                  claiming ||
                  !isAuthenticated ||
                  stats.claimedToday >= stats.dailyLimit
                }
                className={cn(
                  "w-full py-4 text-lg font-bold rounded-xl transition-all duration-300",
                  stats.claimedToday < stats.dailyLimit && isAuthenticated
                    ? "bg-[#18E614]/40 text-white hover:shadow-lg hover:shadow-[#18E614]/20"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                )}
              >
                {claiming ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Claiming...
                  </div>
                ) : stats.claimedToday < stats.dailyLimit ? (
                  `Claim ${stats.dailyLimit} MVT Tokens`
                ) : (
                  "Daily limit reached"
                )}
              </motion.button>

              {!isAuthenticated && (
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Please connect your wallet to claim tokens
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Recent Claims */}
        {claims.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`relative rounded-3xl overflow-hidden ${
              theme === "dark" ? "bg-[#0B0B0C]/60" : "bg-white/60"
            } backdrop-blur-xl border border-white/10`}
          >
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="h-5 w-5 text-emerald-500" />
                <h3
                  className={`font-bold text-lg ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Recent Claims
                </h3>
              </div>
              <p
                className={`text-sm mb-6 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Your recent faucet claim history
              </p>

              <div className="space-y-3">
                {claims.slice(0, 5).map((claim, idx) => (
                  <motion.div
                    key={claim.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + idx * 0.05 }}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      theme === "dark"
                        ? "bg-white/[0.02] border-white/10"
                        : "bg-black/[0.02] border-black/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getClaimStatusIcon(claim.status)}
                      <div>
                        <div
                          className={`font-medium ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {claim.amount} MVT
                        </div>
                        <div
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {formatDate(claim.timestamp)}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        claim.status === "completed"
                          ? theme === "dark"
                            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                            : "bg-emerald-100 border-emerald-300 text-emerald-700"
                          : claim.status === "pending"
                          ? theme === "dark"
                            ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400"
                            : "bg-yellow-100 border-yellow-300 text-yellow-700"
                          : theme === "dark"
                          ? "bg-red-500/20 border-red-500/30 text-red-400"
                          : "bg-red-100 border-red-300 text-red-700"
                      }`}
                    >
                      {claim.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
