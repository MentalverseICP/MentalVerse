import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/Separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Copy, ExternalLink, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { authService } from '@/services/backend';
import type { Transaction as BackendTransaction } from '@/services/backend';

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  from: string;
  to: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  memo?: string;
  fee: number;
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
  const [balance, setBalance] = useState(850.25);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTransferData();
    }
  }, [isAuthenticated, user]);

  const fetchTransferData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch actual data from backend
      const [balanceData, transactionHistory] = await Promise.all([
        authService.getTokenBalance(),
        authService.getTransactionHistory()
      ]);
      
      setBalance(balanceData.balance);
      
      // Convert backend transactions to component format
      const formattedTransactions: Transaction[] = transactionHistory.map((tx: BackendTransaction) => ({
        id: tx.id,
        type: tx.from === (user?.principal || '') ? 'sent' : 'received',
        amount: tx.amount,
        from: tx.from,
        to: tx.to,
        timestamp: tx.timestamp,
        status: tx.status,
        memo: tx.memo,
        fee: tx.fee || 0.01,
        blockHeight: tx.blockHeight,
        txHash: tx.txHash
      }));
      
      setTransactions(formattedTransactions);
      
      // Mock contacts for now - could be enhanced with a contacts API
      setContacts([
        {
          id: '1',
          name: 'Dr. Smith Clinic',
          address: 'dr-smith-clinic',
          lastUsed: Date.now() - (2 * 60 * 60 * 1000)
        },
        {
          id: '2',
          name: 'Wellness Center',
          address: 'wellness-center',
          lastUsed: Date.now() - (24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          name: 'Mental Health Support',
          address: 'mh-support-org',
          lastUsed: Date.now() - (72 * 60 * 60 * 1000)
        }
      ]);
      
    } catch (err) {
      setError('Failed to fetch transfer data');
      console.error('Transfer data fetch error:', err);
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
      setError('Please enter recipient address and amount');
      return;
    }

    const transferAmount = parseFloat(amount);
    
    if (transferAmount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (transferAmount > balance) {
      setError('Insufficient balance');
      return;
    }

    if (!validateAddress(recipient)) {
      setError('Invalid recipient address format');
      return;
    }

    try {
      setSending(true);
      setError(null);
      setSuccess(null);
      
      // Call actual transfer API
      await authService.transferTokens(recipient, transferAmount, memo);
      
      // Add to contacts if not already there
      if (!contacts.find(c => c.address === recipient)) {
        const newContact: Contact = {
          id: Date.now().toString(),
          name: recipient,
          address: recipient,
          lastUsed: Date.now()
        };
        setContacts(prev => [newContact, ...prev]);
      }
      
      setRecipient('');
      setAmount('');
      setMemo('');
      setSelectedContact(null);
      setSuccess('Transfer completed successfully!');
      
      // Refresh transfer data after successful transfer
      await fetchTransferData();
      
    } catch (err) {
      setError('Failed to send tokens');
      console.error('Transfer error:', err);
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
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(null), 2000);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to access transfer features.</p>
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
    <div className="space-y-6">
      {/* Balance Overview */}
      <Card className={cn('border-2', theme === 'dark' ? 'bg-[#0B0B0C] border-[#2f3339]' : 'bg-white border-gray-200')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
          <Send className="h-4 w-4 text-[#18E614]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#18E614]">{formatAmount(balance)} MVT</div>
          <p className="text-xs text-muted-foreground">Ready to transfer</p>
        </CardContent>
      </Card>

      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Tokens */}
        <Card className={cn('border-2', theme === 'dark' ? 'bg-[#0B0B0C] border-[#2f3339]' : 'bg-white border-gray-200')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Tokens
            </CardTitle>
            <CardDescription>
              Transfer MVT tokens to another address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                placeholder="Enter recipient address"
                value={recipient}
                onChange={(e) => {
                  setRecipient(e.target.value);
                  setSelectedContact(null);
                }}
              />
              {selectedContact && (
                <p className="text-xs text-muted-foreground">
                  Sending to: {selectedContact.name}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-right"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Available: {formatAmount(balance)} MVT</span>
                <span>Fee: 0.01 MVT</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="memo">Memo (Optional)</Label>
              <Textarea
                id="memo"
                placeholder="Add a note for this transfer"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={2}
              />
            </div>
            
            {amount && (
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Amount:</span>
                  <span className="font-medium">{formatAmount(parseFloat(amount) || 0)} MVT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Network Fee:</span>
                  <span className="font-medium">0.01 MVT</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-sm font-medium">
                  <span>Total:</span>
                  <span>{formatAmount((parseFloat(amount) || 0) + 0.01)} MVT</span>
                </div>
              </div>
            )}
            
            <Button 
              onClick={handleSend} 
              disabled={!recipient || !amount || sending}
              className="w-full bg-[#18E614] hover:bg-[#15CC11] text-black"
            >
              {sending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  Sending...
                </div>
              ) : (
                'Send Tokens'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Contacts */}
        <Card className={cn('border-2', theme === 'dark' ? 'bg-[#0B0B0C] border-[#2f3339]' : 'bg-white border-gray-200')}>
          <CardHeader>
            <CardTitle>Recent Contacts</CardTitle>
            <CardDescription>
              Quick access to frequently used addresses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <div className="text-center py-8">
                <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No contacts yet</p>
                <p className="text-sm text-muted-foreground">Send tokens to create contacts</p>
              </div>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div 
                      key={contact.id} 
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-colors",
                        selectedContact?.id === contact.id 
                          ? "border-[#18E614] bg-[#18E614]/10" 
                          : "hover:bg-muted"
                      )}
                      onClick={() => handleContactSelect(contact)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {contact.address}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(contact.address);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last used: {formatDate(contact.lastUsed)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className={cn('border-2', theme === 'dark' ? 'bg-[#0B0B0C] border-[#2f3339]' : 'bg-white border-gray-200')}>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Your recent token transfers and transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground">Your transfer history will appear here</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-full",
                          tx.type === 'sent' ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'
                        )}>
                          {tx.type === 'sent' ? (
                            <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {tx.type === 'sent' ? 'Sent' : 'Received'} {formatAmount(tx.amount)} MVT
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {tx.type === 'sent' ? `To: ${tx.to}` : `From: ${tx.from}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <Badge className={getStatusColor(tx.status)}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    
                    {tx.memo && (
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {tx.memo}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <div>
                        <p>Date</p>
                        <p className="font-medium text-foreground">{formatDate(tx.timestamp)}</p>
                      </div>
                      <div>
                        <p>Fee</p>
                        <p className="font-medium text-foreground">{formatAmount(tx.fee)} MVT</p>
                      </div>
                    </div>
                    
                    {tx.txHash && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <p className="text-xs text-muted-foreground">Transaction Hash:</p>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{tx.txHash}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(tx.txHash!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://explorer.example.com/tx/${tx.txHash}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}