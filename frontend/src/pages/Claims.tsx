import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { useSidebar } from "@/components/ui/Sidebar";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

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
  // ...add more claims
];

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-500",
  Approved: "bg-green-500",
  Rejected: "bg-red-500",
};

const Claims: React.FC = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredClaims = claimsData.filter(
    (claim) =>
      claim.title.toLowerCase().includes(search.toLowerCase()) ||
      claim.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={cn(
        "p-5 md:p-10 w-full min-h-screen flex flex-col items-center",
        isCollapsed ? "md:w-[90vw]" : "md:w-[80vw]"
      )}
    >
      <div className="w-full max-w-4xl bg-black dark:bg-white/5 rounded-2xl border border-gray-700 dark:border-gray-200 p-6 md:p-12 mt-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bold text-2xl text-red-500 mb-2">Claims</h1>
          <p className="text-gray-300 dark:text-gray-400">
            Submit a claim for medical expenses, lab tests, or other eligible reimbursements. Track the status of your claims below.
          </p>
        </div>
        {/* Info Card */}
        <div className="bg-[#181A2A] dark:bg-white/10 rounded-xl p-4 mb-8 border border-gray-700 dark:border-gray-200 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1">
            <h2 className="font-semibold text-white dark:text-white text-lg mb-1">How to make a claim?</h2>
            <ul className="list-disc ml-5 text-gray-300 dark:text-gray-400 text-sm">
              <li>Gather your medical receipts or documents.</li>
              <li>Click the <span className="font-semibold text-green-400">New Claim</span> button.</li>
              <li>Fill in the claim form and upload your documents.</li>
              <li>Track your claim status below.</li>
            </ul>
          </div>
          <Button
            className="rounded-full bg-green-500 text-white px-8 py-3 font-bold"
            onClick={() => navigate("/claims/new")}
          >
            New Claim
          </Button>
        </div>
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            className="w-full sm:w-1/2 rounded-full bg-black dark:bg-white/5 border border-gray-700 dark:border-gray-200 text-white dark:text-white"
            placeholder="Search claims by title or status"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Claims List */}
        <div className="flex flex-col gap-4">
          {filteredClaims.length === 0 && (
            <div className="text-center text-gray-400">No claims found.</div>
          )}
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between bg-[#181A2A] dark:bg-white/10 rounded-xl p-4 border border-gray-700 dark:border-gray-200"
            >
              <div className="flex-1">
                <div className="font-semibold text-white dark:text-white">{claim.title}</div>
                <div className="text-xs text-gray-400 mb-1">{claim.date}</div>
                <div className="text-sm text-gray-300 dark:text-gray-400">{claim.description}</div>
              </div>
              <div className="flex items-center gap-4 mt-2 md:mt-0">
                <span className={`text-xs px-3 py-1 rounded-full text-white ${statusColors[claim.status] || "bg-gray-500"}`}>
                  {claim.status}
                </span>
                <span className="font-bold text-green-400">{claim.amount}</span>
                <Button
                  className="rounded-full bg-green-500 text-white px-6 py-2"
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