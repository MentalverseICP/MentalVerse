import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/shared/theme-provider";
import { motion } from "framer-motion";
import { Gift, Search } from "lucide-react";

const claimsData = [
  {
    id: 1,
    title: "Medical Reimbursement",
    status: "Pending",
    amount: "₦50,000",
    date: "2024-06-01",
    description: "Reimbursement for malaria treatment at City Hospital.",
  },
  {
    id: 2,
    title: "Lab Test Refund",
    status: "Approved",
    amount: "₦15,000",
    date: "2024-05-20",
    description: "Refund for blood test at Medilab.",
  },
];

const statusColors: Record<string, string> = {
  Pending:
    "bg-yellow-500/20 border-yellow-500/30 text-yellow-600 dark:text-yellow-400",
  Approved:
    "bg-[#18E614]/20 border-[#18E614]/30 text-[#12B80E] dark:text-[#7FF54A]",
  Rejected: "bg-red-500/20 border-red-500/30 text-red-600 dark:text-red-400",
};

const statusOptions = ["All", "Pending", "Approved", "Rejected"];

const Claims: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();
  const { theme } = useTheme();

  const filteredClaims = claimsData.filter(
    (claim) =>
      (statusFilter === "All" || claim.status === statusFilter) &&
      (claim.title.toLowerCase().includes(search.toLowerCase()) ||
        claim.status.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen flex items-center justify-center transition-colors duration-500 px-2 py-8 sm:p-4 md:p-8 p-5 relative max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)]"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full mx-auto p-4 sm:p-8 md:p-12 flex flex-col gap-8 transition-all duration-300"
      >
        <div>
          <h1
            className={`font-bold text-3xl sm:text-4xl mb-2 flex items-center gap-3 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            <Gift className="w-8 h-8 text-[#18E614]" />
            Claims
          </h1>
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Submit a claim for medical expenses, lab tests, or other eligible
            reimbursements.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`rounded-2xl p-6 sm:p-8 border ${
            theme === "dark"
              ? "bg-[#18E614]/20 border-[#18E614]/30"
              : "bg-[#12B80E]/10 border-[#12B80E]/20"
          }`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <h2
                className={`font-bold text-lg mb-3 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                How to make a claim?
              </h2>
              <ul className="space-y-2">
                {[
                  "Gather your medical receipts or documents.",
                  "Click the New Claim button.",
                  "Fill in the claim form and upload your documents.",
                  "Track your claim status below.",
                ].map((item, i) => (
                  <li
                    key={i}
                    className={`text-sm flex items-start gap-3 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 rounded-xl bg-[#18E614]/40 text-white font-bold text-sm hover:shadow-lg hover:shadow-[#18E614]/20 transition-all whitespace-nowrap"
              onClick={() => navigate("/claims/new")}
            >
              New Claim
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`relative rounded-3xl overflow-hidden ${
            theme === "dark" ? "bg-[#0B0B0C]/60" : "bg-white/60"
          } backdrop-blur-xl border ${
            theme === "dark" ? "border-white/10" : "border-black/15"
          }`}
        >
          <div
            className={`absolute -top-40 -right-40 w-80 h-80 ${
              theme === "dark" ? "bg-[#18E614]/10" : "bg-[#18E614]/30"
            } rounded-full blur-3xl`}
          />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div
                className={`flex-grow flex items-center rounded-xl p-2 overflow-hidden ${
                  theme === "dark"
                    ? "bg-white/[0.02] border border-white/10"
                    : "bg-black/[0.05] border border-black/10"
                }`}
              >
                <Search className="h-5 w-5 flex-none text-gray-500 ml-3" />
                <input
                  type="text"
                  placeholder="Search claims..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-gray-700 dark:text-gray-300 py-2 px-4 text-sm"
                />
              </div>

              <div className="flex gap-2">
                {statusOptions.map((option) => (
                  <motion.button
                    key={option}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStatusFilter(option)}
                    className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all ${
                      statusFilter === option
                        ? "bg-[#18E614]/40 text-white"
                        : theme === "dark"
                        ? "bg-white/10 text-gray-300 hover:bg-white/20"
                        : "bg-black/[0.08] text-gray-800 hover:bg-black/[0.12]"
                    }`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredClaims.length > 0 ? (
                filteredClaims.map((claim, index) => (
                  <motion.div
                    key={claim.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + index * 0.05 }}
                    className={`p-4 rounded-xl border ${
                      theme === "dark"
                        ? "bg-white/[0.02] border-white/10 hover:bg-white/[0.05]"
                        : "bg-black/[0.04] border-black/10 hover:bg-black/[0.07]"
                    } transition-all cursor-pointer group`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className={`font-semibold ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {claim.title}
                          </h3>
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full border ${
                              statusColors[claim.status]
                            }`}
                          >
                            {claim.status}
                          </span>
                        </div>
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          } mb-2`}
                        >
                          {claim.description}
                        </p>
                        <p
                          className={`text-xs ${
                            theme === "dark" ? "text-gray-500" : "text-gray-600"
                          }`}
                        >
                          {claim.date}
                        </p>
                      </div>
                      <p
                        className={`font-bold text-lg ml-4 ${
                          theme === "dark"
                            ? "text-emerald-400"
                            : "text-emerald-600"
                        }`}
                      >
                        {claim.amount}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-8 text-center rounded-xl ${
                    theme === "dark"
                      ? "bg-white/[0.02] border border-white/10"
                      : "bg-black/[0.02] border border-black/10"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    No claims found matching your filters.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Claims;
