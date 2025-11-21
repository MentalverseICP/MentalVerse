import React from "react";
import SecureChat from "@/components/shared/SecureChat";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/shared/theme-provider";

const Chats: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="w-full h-screen flex relative sm:p-4 md:p-8 p-5 max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <div className="relative w-full h-full rounded-3xl overflow-hidden">
          <div
            className={`absolute inset-0 ${
              theme === "dark" ? "bg-[#0B0B0C]/80" : "bg-white/80"
            } backdrop-blur-xl`}
          />
          <div
            className={`absolute inset-0 rounded-3xl border ${
              theme === "dark" ? "border-white/10" : "border-black/15"
            }`}
          />

          {/* Corner accent glows */}
          <div
            className={`absolute top-0 -left-20 w-40 h-40 ${
              theme === "dark" ? "bg-[#18E614]/10" : "bg-[#18E614]/30"
            } rounded-full blur-3xl`}
          />
          <div
            className={`absolute -bottom-20 -right-20 w-40 h-40 ${
              theme === "dark" ? "bg-[#18E614]/10" : "bg-[#18E614]/30"
            } rounded-full blur-3xl`}
          />
          <div
            className={`absolute bottom-0 -left-20 w-40 h-40 ${
              theme === "dark" ? "bg-[#18E614]/10" : "bg-[#18E614]/30"
            } rounded-full blur-3xl`}
          />
          <div
            className={`absolute -top-20 -right-20 w-40 h-40 ${
              theme === "dark" ? "bg-[#18E614]/10" : "bg-[#18E614]/30"
            } rounded-full blur-3xl`}
          />
          <div
            className={`absolute top-1/4 right-1/4 w-[40rem] h-[40rem] ${
              theme === "dark" ? "bg-[#18e61404]" : "bg-[#18e61408]"
            } rounded-full blur-3xl`}
          />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="relative h-full flex flex-col">
            <div className="flex flex-row items-center justify-between p-6 border-b border-white/5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="p-2.5 rounded-xl bg-[#18E614]-500/20 border border-[#18E614]-500/30">
                  <Shield className="w-6 h-6 text-[#18E614]-500" />
                </div>
                <div>
                  <h1
                    className={`text-2xl font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Secure Messages
                  </h1>
                  <p
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    End-to-end encrypted conversations
                  </p>
                </div>
              </motion.div>

              <div
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  theme === "dark"
                    ? "bg-[#18E614]-500/20 border border-[#18E614]-500/30 text-[#18E614]-300"
                    : "bg-[#18E614]-100 border border-[#18E614]-200 text-[#18E614]-700"
                }`}
              >
                🔒 Secured
              </div>
            </div>

            <div className="flex-1 overflow-hidden p-6">
              <SecureChat />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Chats;
