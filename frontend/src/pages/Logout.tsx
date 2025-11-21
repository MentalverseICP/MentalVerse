import { useTheme } from "@/components/shared/theme-provider";
import { Link, useNavigate } from "react-router-dom";
import mentalIconMobileLight from "@/images/mental_Icon_mobile_light.svg";
import mentalIconMobileDark from "@/images/mental_mobile.svg";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { Brain, LogOut } from "lucide-react";
import { motion } from "framer-motion";

interface LogoutProps {
  onWalletDisconnect?: () => void;
}

const Logout = ({ onWalletDisconnect }: LogoutProps) => {
  const { theme } = useTheme();
  const { logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showLoader, setShowLoader] = useState(false);

  const getIcon = () => {
    return theme === "dark" ? mentalIconMobileDark : mentalIconMobileLight;
  };

  useEffect(() => {
    if (!isAuthenticated && !showLoader) {
      navigate("/");
    }
  }, [isAuthenticated, showLoader, navigate]);

  const handleDisconnect = async () => {
    try {
      setShowLoader(true);
      await logout();
      if (onWalletDisconnect) {
        onWalletDisconnect();
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    } finally {
      setShowLoader(false);
    }
  };

  const Loader = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`text-center p-8 rounded-3xl backdrop-blur-xl border border-white/10 ${
          theme === "dark" ? "bg-[#0B0B0C]/80" : "bg-white/80"
        }`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 bg-[#18E614]/40 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#18E614]/20"
        >
          <Brain className="text-white" size={32} />
        </motion.div>
        <p
          className={`${
            theme === "dark" ? "text-gray-200" : "text-gray-800"
          } font-semibold`}
        >
          Disconnecting Wallet...
        </p>
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen flex items-center justify-center transition-colors duration-500 sm:p-4 md:p-8 p-5 relative max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)]"
    >
      {showLoader && <Loader />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-lg mx-auto flex flex-col items-center"
      >
        <div
          className={`relative w-full rounded-3xl overflow-hidden p-6 sm:p-8 md:p-10 ${
            theme === "dark" ? "bg-[#0B0B0C]/80" : "bg-white/80"
          } backdrop-blur-xl border border-white/10`}
        >
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="relative space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/30">
                <LogOut className="w-8 h-8 text-red-500" />
              </div>
              <h1
                className={`text-3xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Logout
              </h1>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Disconnect your wallet safely
              </p>
            </motion.div>

            <Link
              to={"/home"}
              className="flex items-center justify-center w-full"
            >
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={getIcon()}
                alt="Mental Verse"
                className="transition-all logo fill-mental h-20 w-32 sm:h-24 sm:w-40 drop-shadow-lg"
              />
            </Link>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div>
                <label
                  className={`text-xs font-semibold block mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="example@mail.com"
                  className={`w-full rounded-xl py-3 px-5 text-base transition-all focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    theme === "dark"
                      ? "bg-white/10 border border-white/20 text-white placeholder-gray-500"
                      : "bg-white/50 border border-black/10 text-black placeholder-gray-600"
                  }`}
                />
              </div>

              {user && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`rounded-xl p-4 text-sm border ${
                    theme === "dark"
                      ? "bg-emerald-500/20 border-emerald-500/30"
                      : "bg-emerald-100 border-emerald-200"
                  }`}
                >
                  <p
                    className={`font-semibold mb-2 ${
                      theme === "dark" ? "text-emerald-300" : "text-emerald-700"
                    }`}
                  >
                    Connected Wallet:
                  </p>
                  <p
                    className={`truncate text-xs ${
                      theme === "dark" ? "text-emerald-200" : "text-emerald-600"
                    }`}
                  >
                    {user.walletAddress || user.principal}
                  </p>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleDisconnect}
                disabled={showLoader || !user}
                className={`w-full px-6 py-3 rounded-xl font-bold transition-all text-sm ${
                  showLoader || !user
                    ? "opacity-50 cursor-not-allowed"
                    : theme === "dark"
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg hover:shadow-red-500/30"
                    : "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg hover:shadow-red-500/20"
                }`}
              >
                {showLoader ? "Disconnecting..." : "Disconnect Wallet"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate("/home")}
                className={`w-full px-6 py-3 rounded-xl font-bold border transition-all text-sm ${
                  theme === "dark"
                    ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    : "bg-black/10 border-black/10 text-gray-900 hover:bg-black/20"
                }`}
              >
                Cancel
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Logout;
