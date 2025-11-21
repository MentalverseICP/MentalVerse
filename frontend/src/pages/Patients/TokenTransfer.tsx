import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/Separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  Info,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/shared/theme-provider";
import { authService } from "@/services/backend";
import type { Transaction as BackendTransaction } from "@/services/backend";
import { useSidebar } from "@/components/ui/Sidebar";
import { motion } from "framer-motion";

interface Transaction {
  id: string;
  type: "sent" | "received";
  amount: number;
  from: string;
  to: string;
  timestamp: number;
  status: "pending" | "completed" | "failed";
  memo?: string;
  fee?: number;
  blockHeight?: number;
  txHash?: string;
}

interface Contact {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  lastUsed: number;
}

export default function TokenTransfer() {
  const { userPrincipal, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [balance, setBalance] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    if (isAuthenticated && userPrincipal) {
      fetchTransferData();
    }
  }, [isAuthenticated, userPrincipal]);

  const fetchTransferData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch actual data from backend
      const [balanceData, transactionHistory] = await Promise.all([
        authService.getTokenBalance(),
        authService.getTransactionHistory(),
      ]);

      setBalance(balanceData.balance);

      // Convert backend transactions to component format
      const formattedTransactions: Transaction[] = transactionHistory.map(
        (tx: BackendTransaction) => ({
          id: tx.id,
          type:
            tx.from === (userPrincipal?.toString() || "") ? "sent" : "received",
          amount: tx.amount,
          from: tx.from || "",
          to: tx.to || "",
          timestamp: tx.timestamp,
          status: tx.status,
          memo: (tx as any).memo,
          fee: (tx as any).fee || 0.01,
          blockHeight: (tx as any).blockHeight,
          txHash: (tx as any).txHash,
        })
      );

      setTransactions(formattedTransactions);

      // Mock contacts for now - could be enhanced with a contacts API
      setContacts([
        {
          id: "1",
          name: "Dr. Smith Clinic",
          address: "dr-smith-clinic",
          lastUsed: Date.now() - 2 * 60 * 60 * 1000,
        },
        {
          id: "2",
          name: "Wellness Center",
          address: "wellness-center",
          lastUsed: Date.now() - 24 * 60 * 60 * 1000,
        },
        {
          id: "3",
          name: "Mental Health Support",
          address: "mh-support-org",
          lastUsed: Date.now() - 72 * 60 * 60 * 1000,
        },
      ]);
    } catch (err) {
      setError("Failed to fetch transfer data");
      console.error("Transfer data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateAddress = (address: string): boolean => {
    // Basic validation - replace with actual address validation
    return address.length >= 3 && /^[a-zA-Z0-9-_]+$/.test(address);
  };

  const handleSend = async () => {
    if (!recipient || !amount) {
      setError("Please enter recipient address and amount");
      return;
    }

    const transferAmount = parseFloat(amount);

    if (transferAmount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (transferAmount > balance) {
      setError("Insufficient balance");
      return;
    }

    if (!validateAddress(recipient)) {
      setError("Invalid recipient address format");
      return;
    }

    try {
      setSending(true);
      setError(null);
      setSuccess(null);

      // Call actual transfer API
      await authService.transferTokens(recipient, transferAmount);

      // Add to contacts if not already there
      if (!contacts.find((c) => c.address === recipient)) {
        const newContact: Contact = {
          id: Date.now().toString(),
          name: recipient,
          address: recipient,
          lastUsed: Date.now(),
        };
        setContacts((prev) => [newContact, ...prev]);
      }

      setRecipient("");
      setAmount("");
      setMemo("");
      setSelectedContact(null);
      setSuccess("Transfer completed successfully!");

      // Refresh transfer data after successful transfer
      await fetchTransferData();
    } catch (err) {
      setError("Failed to send tokens");
      console.error("Transfer error:", err);
    } finally {
      setSending(false);
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setRecipient(contact.address);
    setSelectedContact(contact);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Copied to clipboard!");
    setTimeout(() => setSuccess(null), 2000);
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return (
          "text-white dark:text-white" +
          (theme === "dark" ? " bg-[#18E614]" : " bg-[#18E614]")
        );
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Please log in to access transfer features.
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
      {/* Balance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`relative rounded-2xl overflow-hidden ${
          theme === "dark" ? "bg-[#0B0B0C]/60" : "bg-white/60"
        } backdrop-blur-xl border border-white/10 p-6`}
      >
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative flex items-center justify-between">
          <div>
            <p
              className={`text-sm font-semibold ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Available Balance
            </p>
            <p className={`text-2xl font-bold text-emerald-500 mt-1`}>
              {formatAmount(balance)} MVT
            </p>
            <p
              className={`text-xs mt-1 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Ready to transfer
            </p>
          </div>
          <Send className="h-8 w-8 text-emerald-500 opacity-20" />
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Tokens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`relative rounded-3xl overflow-hidden ${
            theme === "dark" ? "bg-[#0B0B0C]/60" : "bg-white/60"
          } backdrop-blur-xl border border-white/10`}
        >
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="relative p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Send className="h-5 w-5 text-emerald-500" />
              <h2
                className={`font-bold text-lg ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Send Tokens
              </h2>
            </div>
            <p
              className={`text-sm mb-6 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Transfer MVT tokens to another address
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  className={`text-sm font-semibold ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Recipient Address
                </label>
                <Input
                  placeholder="Enter recipient address"
                  value={recipient}
                  onChange={(e) => {
                    setRecipient(e.target.value);
                    setSelectedContact(null);
                  }}
                  className={`rounded-xl px-4 py-2.5 text-sm transition-colors ${
                    theme === "dark"
                      ? "bg-white/[0.02] border border-white/10 text-white placeholder-gray-500 focus:border-emerald-500/50"
                      : "bg-black/[0.02] border border-black/10 text-gray-900 placeholder-gray-600 focus:border-emerald-500/50"
                  }`}
                />
                {selectedContact && (
                  <p
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Sending to: {selectedContact.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  className={`text-sm font-semibold ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Amount
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`rounded-xl px-4 py-2.5 text-sm text-right transition-colors ${
                    theme === "dark"
                      ? "bg-white/[0.02] border border-white/10 text-white placeholder-gray-500 focus:border-emerald-500/50"
                      : "bg-black/[0.02] border border-black/10 text-gray-900 placeholder-gray-600 focus:border-emerald-500/50"
                  }`}
                />
                <div
                  className={`flex justify-between text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span>Available: {formatAmount(balance)} MVT</span>
                  <span>Fee: 0.01 MVT</span>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className={`text-sm font-semibold ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Memo (Optional)
                </label>
                <Textarea
                  placeholder="Add a note for this transfer"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows={2}
                  className={`rounded-xl px-4 py-2.5 text-sm transition-colors resize-none ${
                    theme === "dark"
                      ? "bg-white/[0.02] border border-white/10 text-white placeholder-gray-500 focus:border-emerald-500/50"
                      : "bg-black/[0.02] border border-black/10 text-gray-900 placeholder-gray-600 focus:border-emerald-500/50"
                  }`}
                />
              </div>

              {amount && (
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
                    <span>Amount:</span>
                    <span className="font-medium">
                      {formatAmount(parseFloat(amount) || 0)} MVT
                    </span>
                  </div>
                  <div
                    className={`flex justify-between text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <span>Network Fee:</span>
                    <span className="font-medium">0.01 MVT</span>
                  </div>
                  <div
                    className={`h-px ${
                      theme === "dark" ? "bg-white/10" : "bg-black/10"
                    }`}
                  />
                  <div
                    className={`flex justify-between text-sm font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <span>Total:</span>
                    <span>
                      {formatAmount((parseFloat(amount) || 0) + 0.01)} MVT
                    </span>
                  </div>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSend}
                disabled={!recipient || !amount || sending}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  !recipient || !amount || sending
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-[#18E614]/40 text-white hover:shadow-lg hover:shadow-[#18E614]/20"
                }`}
              >
                {sending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Sending...
                  </div>
                ) : (
                  "Send Tokens"
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Recent Contacts */}
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
            <h2
              className={`font-bold text-lg mb-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Recent Contacts
            </h2>
            <p
              className={`text-sm mb-6 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Quick access to frequently used addresses
            </p>

            {contacts.length === 0 ? (
              <div className="text-center py-8">
                <Send className="h-12 w-12 opacity-20 mx-auto mb-4" />
                <p
                  className={
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }
                >
                  No contacts yet
                </p>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-500" : "text-gray-600"
                  }`}
                >
                  Send tokens to create contacts
                </p>
              </div>
            ) : (
              <ScrollArea
                className={`h-64 rounded-xl ${
                  theme === "dark"
                    ? "bg-white/[0.02] border border-white/10"
                    : "bg-black/[0.02] border border-black/10"
                } p-4`}
              >
                <div className="space-y-2">
                  {contacts.map((contact, idx) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + idx * 0.05 }}
                      onClick={() => handleContactSelect(contact)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        selectedContact?.id === contact.id
                          ? theme === "dark"
                            ? "bg-emerald-500/20 border-emerald-500/30"
                            : "bg-emerald-100 border-emerald-300"
                          : theme === "dark"
                          ? "hover:bg-white/[0.05] border-white/10"
                          : "hover:bg-black/[0.05] border-black/10"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {contact.name}
                          </p>
                          <p
                            className={`text-xs truncate ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            {contact.address}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(contact.address);
                          }}
                          className={`p-1 rounded transition-colors ${
                            theme === "dark"
                              ? "hover:bg-white/10"
                              : "hover:bg-black/10"
                          }`}
                        >
                          <Copy className="h-4 w-4 text-emerald-500" />
                        </motion.button>
                      </div>
                      <p
                        className={`text-xs mt-1 ${
                          theme === "dark" ? "text-gray-500" : "text-gray-600"
                        }`}
                      >
                        Last used: {formatDate(contact.lastUsed)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </motion.div>
      </div>

      {/* Transaction History */}
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
          <h2
            className={`font-bold text-lg mb-2 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Transaction History
          </h2>
          <p
            className={`text-sm mb-6 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Your recent token transfers and transactions
          </p>

          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Send className="h-12 w-12 opacity-20 mx-auto mb-4" />
              <p
                className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
              >
                No transactions yet
              </p>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-500" : "text-gray-600"
                }`}
              >
                Your transfer history will appear here
              </p>
            </div>
          ) : (
            <ScrollArea
              className={`h-96 rounded-xl ${
                theme === "dark"
                  ? "bg-white/[0.02] border border-white/10"
                  : "bg-black/[0.02] border border-black/10"
              } p-4`}
            >
              <div className="space-y-4">
                {transactions.map((tx, idx) => (
                  <motion.div
                    key={tx.id}
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
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            tx.type === "sent"
                              ? "bg-red-100 dark:bg-red-500/20"
                              : "bg-emerald-100 dark:bg-emerald-500/20"
                          }`}
                        >
                          {tx.type === "sent" ? (
                            <ArrowUpRight
                              className={`h-4 w-4 ${
                                theme === "dark"
                                  ? "text-red-400"
                                  : "text-red-600"
                              }`}
                            />
                          ) : (
                            <ArrowDownLeft
                              className={`h-4 w-4 ${
                                theme === "dark"
                                  ? "text-emerald-400"
                                  : "text-emerald-600"
                              }`}
                            />
                          )}
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {tx.type === "sent" ? "Sent" : "Received"}{" "}
                            {formatAmount(tx.amount)} MVT
                          </p>
                          <p
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            {tx.type === "sent"
                              ? `To: ${tx.to}`
                              : `From: ${tx.from}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border ${
                            tx.status === "completed"
                              ? theme === "dark"
                                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                                : "bg-emerald-100 border-emerald-300 text-emerald-700"
                              : tx.status === "pending"
                              ? theme === "dark"
                                ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400"
                                : "bg-yellow-100 border-yellow-300 text-yellow-700"
                              : theme === "dark"
                              ? "bg-red-500/20 border-red-500/30 text-red-400"
                              : "bg-red-100 border-red-300 text-red-700"
                          }`}
                        >
                          {tx.status.charAt(0).toUpperCase() +
                            tx.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {tx.memo && (
                      <p
                        className={`text-sm p-2 rounded ${
                          theme === "dark"
                            ? "bg-white/[0.02] text-gray-300"
                            : "bg-black/[0.02] text-gray-700"
                        }`}
                      >
                        {tx.memo}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p
                          className={
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }
                        >
                          Date
                        </p>
                        <p
                          className={`font-medium ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {formatDate(tx.timestamp)}
                        </p>
                      </div>
                      <div>
                        <p
                          className={
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }
                        >
                          Fee
                        </p>
                        <p
                          className={`font-medium ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {formatAmount(tx.fee || 0.01)} MVT
                        </p>
                      </div>
                    </div>

                    {tx.txHash && (
                      <div
                        className={`flex items-center gap-2 pt-2 border-t ${
                          theme === "dark"
                            ? "border-white/10"
                            : "border-black/10"
                        }`}
                      >
                        <p
                          className={`text-xs ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          TxHash:
                        </p>
                        <code
                          className={`text-xs px-2 py-1 rounded font-mono ${
                            theme === "dark"
                              ? "bg-white/[0.02] text-gray-300"
                              : "bg-black/[0.02] text-gray-700"
                          }`}
                        >
                          {tx.txHash.substring(0, 12)}...
                        </code>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => copyToClipboard(tx.txHash!)}
                          className="ml-auto"
                        >
                          <Copy className="h-3 w-3 text-emerald-500 hover:text-emerald-600" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            window.open(
                              `https://explorer.example.com/tx/${tx.txHash}`,
                              "_blank"
                            )
                          }
                        >
                          <ExternalLink className="h-3 w-3 text-emerald-500 hover:text-emerald-600" />
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
