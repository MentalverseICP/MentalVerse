import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { useSidebar } from "@/components/ui/Sidebar";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/shared/theme-provider";

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
  Pending: "bg-yellow-500",
  Approved: "bg-green-500",
  Rejected: "bg-red-500",
};

const statusOptions = ["All", "Pending", "Approved", "Rejected"];

const Claims: React.FC = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
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
    <div
      className={cn(
        "w-full flex items-center justify-center transition-colors duration-500 px-2 py-8 sm:p-4 md:p-8 p-5 relative max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)] dark:bg-transparent",
        isCollapsed ? "md:w-[90vw]" : "md:w-[80vw]"
      )}
    >
      <div className="w-full mx-auto p-4 sm:p-8 md:p-12 mt-4 flex flex-col gap-8 transition-all duration-300">
        {/* Header */}
        <div className="mb-2">
          <h1 className="font-extrabold text-2xl text-red-500 mb-2">
            Claims
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Submit a claim for medical expenses, lab tests, or other eligible
            reimbursements. Track the status of your claims below.
          </p>
        </div>
        {/* Info Card */}
        <div className="bg-[#18E614]dark:bg-gray-900 rounded-xl p-4 mb-4 border border-[#18E614] dark:border-gray-800 flex flex-col md:flex-row items-center gap-4 shadow-sm">
          <div className="flex-1">
            <h2 className="font-semibold text-black dark:text-white text-lg mb-1">
              How to make a claim?
            </h2>
            <ul className="list-disc ml-5 text-gray-600 dark:text-gray-400 text-sm">
              <li>Gather your medical receipts or documents.</li>
              <li>
                Click the{" "}
                <span className="font-semibold text-[#18E614] dark:text-[#18E614]">
                  New Claim
                </span>{" "}
                button.
              </li>
              <li>Fill in the claim form and upload your documents.</li>
              <li>Track your claim status below.</li>
            </ul>
          </div>
          <Button
            className="rounded-xl bg-gradient-to-r from-[#6b9a41] to-[#18e614c0] text-white font-bold px-8 py-3 shadow-lg hover:from-[#18e614c4] hover:to-[#109326] transition-all"
            onClick={() => navigate("/claims/new")}
          >
            New Claim
          </Button>
        </div>
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            className="w-full sm:w-1/2 rounded-xl bg-white dark:bg-gray-900 border border-[#18E614] dark:border-gray-700 text-black dark:text-white shadow-sm"
            placeholder="Search claims by title or status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            title="Status"
            className="w-full sm:w-1/4 rounded-xl bg-white dark:bg-gray-900 border border-[#18E614] dark:border-gray-700 text-black dark:text-white shadow-sm px-4 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {/* Claims List */}
        <div className="flex flex-col gap-4">
          {filteredClaims.length === 0 && (
            <div className="text-center text-gray-400">No claims found.</div>
          )}
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between bg-[#18E614]dark:bg-gray-900 rounded-xl p-4 border border-[#18E614] dark:border-gray-800 shadow hover:shadow-lg transition-all"
            >
              <div className="flex-1 mb-2 md:mb-0">
                <div className="font-semibold text-black dark:text-white">
                  {claim.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {claim.date}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {claim.description}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 md:mt-0">
                <span
                  className={`text-xs px-3 py-1 rounded-full text-white font-semibold ${
                    statusColors[claim.status] || "bg-gray-500"
                  }`}
                >
                  {claim.status}
                </span>
                <span className="font-bold text-black dark:text-white">
                  {claim.amount}
                </span>
                <Button
                  className={`px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold border hover:-translate-y-1 transition-all duration-300 hover:border-t hover:border-b text-sm ${
                    theme === 'dark'
                      ? 'bg-black hover:bg-black hover:shadow-[0_2px_0_0_rgba(24,230,20,0.811)] hover:border-[#18E614]'
                      : 'bg-white text-[#18E614] hover:bg-zinc-100 hover:border-black hover:shadow-[0_2px_0_0_rgba(0,0,0,0.811)]'
                  }`}
                  onClick={() => navigate(`/claims/${claim.id}`)}
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Claims;