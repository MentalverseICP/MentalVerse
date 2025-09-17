import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Float "mo:base/Float";

module {
    // === PAYMENT TYPES ===
    
    public type PaymentStatus = {
        #pending;
        #processing;
        #completed;
        #failed;
        #refunded;
        #cancelled;
    };
    
    public type PaymentMethod = {
        #mvt_token;
        #escrow;
        #subscription;
    };
    
    public type RefundReason = {
        #service_not_provided;
        #quality_issue;
        #cancellation;
        #dispute_resolution;
        #technical_error;
        #policy_violation;
    };
    
    public type PaymentTransaction = {
        id: Text;
        payerId: Principal;
        payeeId: Principal;
        amount: Nat;
        serviceType: Text;
        paymentMethod: PaymentMethod;
        status: PaymentStatus;
        createdAt: Int;
        completedAt: ?Int;
        failedAt: ?Int;
        refundedAt: ?Int;
        refundReason: ?RefundReason;
        escrowReleaseConditions: ?Text;
        autoRefundEnabled: Bool;
        refundDeadline: ?Int;
        transactionHash: ?Text;
    };
    
    public type EscrowStatus = {
        #pending;
        #funded;
        #released;
        #refunded;
        #disputed;
    };
    
    public type EscrowContract = {
        id: Text;
        payerId: Principal;
        payeeId: Principal;
        amount: Nat;
        serviceDescription: Text;
        releaseConditions: Text;
        createdAt: Int;
        fundedAt: ?Int;
        releasedAt: ?Int;
        status: EscrowStatus;
        disputeReason: ?Text;
        arbitrator: ?Principal;
    };
    
    public type PaymentPlan = {
        id: Text;
        payerId: Principal;
        payeeId: Principal;
        totalAmount: Nat;
        installmentAmount: Nat;
        frequency: Text; // "weekly", "monthly", "quarterly"
        remainingInstallments: Nat;
        nextPaymentDate: Int;
        createdAt: Int;
        status: PaymentStatus;
        autoPayEnabled: Bool;
    };
    
    public type PaymentStatistics = {
        totalTransactions: Nat;
        completedTransactions: Nat;
        refundedTransactions: Nat;
        totalEscrowContracts: Nat;
        activePaymentPlans: Nat;
        totalPaymentVolume: Nat;
        averageTransactionAmount: Nat;
        successRate: Float;
    };
    
    public type DisputeStatus = {
        #open;
        #under_review;
        #resolved;
        #escalated;
    };
    
    public type PaymentDispute = {
        id: Text;
        transactionId: Text;
        disputantId: Principal;
        respondentId: Principal;
        reason: Text;
        description: Text;
        status: DisputeStatus;
        createdAt: Int;
        resolvedAt: ?Int;
        resolution: ?Text;
        arbitrator: ?Principal;
    };
    
    // === PAYMENT PROCESSING CLASS ===
    
    public class PaymentProcessor() {
        // Non-stable HashMaps for runtime operations (no stable keyword in class)
        private var paymentTransactions = HashMap.HashMap<Text, PaymentTransaction>(50, Text.equal, Text.hash);
        private var escrowContracts = HashMap.HashMap<Text, EscrowContract>(20, Text.equal, Text.hash);
        private var paymentPlans = HashMap.HashMap<Text, PaymentPlan>(20, Text.equal, Text.hash);
        private var paymentDisputes = HashMap.HashMap<Text, PaymentDispute>(10, Text.equal, Text.hash);
        private var transactionSequence : Nat = 0;
        
        // Constants
        private let DEFAULT_REFUND_DEADLINE_HOURS = 72; // 72 hours
        private let _ESCROW_TIMEOUT_DAYS = 30; // 30 days
        private let _DISPUTE_RESOLUTION_DAYS = 14; // 14 days
        
        // === INITIALIZATION FROM EXTERNAL STABLE STORAGE ===
        
        public func initFromStableStorage(
            paymentTransactionsEntries: [(Text, PaymentTransaction)],
            escrowContractsEntries: [(Text, EscrowContract)],
            paymentPlansEntries: [(Text, PaymentPlan)],
            paymentDisputesEntries: [(Text, PaymentDispute)],
            savedTransactionSequence: Nat
        ) {
            // Restore payment data from stable storage
            for ((id, transaction) in paymentTransactionsEntries.vals()) {
                paymentTransactions.put(id, transaction);
            };
            for ((id, contract) in escrowContractsEntries.vals()) {
                escrowContracts.put(id, contract);
            };
            for ((id, plan) in paymentPlansEntries.vals()) {
                paymentPlans.put(id, plan);
            };
            for ((id, dispute) in paymentDisputesEntries.vals()) {
                paymentDisputes.put(id, dispute);
            };
            transactionSequence := savedTransactionSequence;
        };
        
        public func exportStableStorage() : {
            paymentTransactionsEntries: [(Text, PaymentTransaction)];
            escrowContractsEntries: [(Text, EscrowContract)];
            paymentPlansEntries: [(Text, PaymentPlan)];
            paymentDisputesEntries: [(Text, PaymentDispute)];
            transactionSequence: Nat;
        } {
            {
                paymentTransactionsEntries = Iter.toArray(paymentTransactions.entries());
                escrowContractsEntries = Iter.toArray(escrowContracts.entries());
                paymentPlansEntries = Iter.toArray(paymentPlans.entries());
                paymentDisputesEntries = Iter.toArray(paymentDisputes.entries());
                transactionSequence = transactionSequence;
            }
        };
        
        // === ID GENERATION ===
        
        private func generatePaymentId() : Text {
            transactionSequence += 1;
            "payment_" # Int.toText(Time.now()) # "_" # Nat.toText(transactionSequence)
        };
        
        private func generateEscrowId() : Text {
            "escrow_" # Int.toText(Time.now()) # "_" # Nat.toText(escrowContracts.size())
        };
        
        private func generatePaymentPlanId() : Text {
            "plan_" # Int.toText(Time.now()) # "_" # Nat.toText(paymentPlans.size())
        };
        
        private func generateDisputeId() : Text {
            "dispute_" # Int.toText(Time.now()) # "_" # Nat.toText(paymentDisputes.size())
        };
        
        // === PAYMENT TRANSACTION OPERATIONS ===
        
        // Create payment transaction
        public func createPaymentTransaction(
            payerId: Principal,
            payeeId: Principal,
            amount: Nat,
            serviceType: Text,
            paymentMethod: PaymentMethod,
            autoRefundEnabled: Bool,
            refundDeadlineHours: ?Nat
        ) : Result.Result<Text, Text> {
            let paymentId = generatePaymentId();
            let now = Time.now();
            
            let refundDeadline = switch (refundDeadlineHours) {
                case null { ?(now + (DEFAULT_REFUND_DEADLINE_HOURS * 3600000000000)) };
                case (?hours) { ?(now + (hours * 3600000000000)) };
            };
            
            let transaction: PaymentTransaction = {
                id = paymentId;
                payerId = payerId;
                payeeId = payeeId;
                amount = amount;
                serviceType = serviceType;
                paymentMethod = paymentMethod;
                status = #pending;
                createdAt = now;
                completedAt = null;
                failedAt = null;
                refundedAt = null;
                refundReason = null;
                escrowReleaseConditions = null;
                autoRefundEnabled = autoRefundEnabled;
                refundDeadline = refundDeadline;
                transactionHash = null;
            };
            
            paymentTransactions.put(paymentId, transaction);
            #ok(paymentId)
        };
        
        // Process payment
        public func processPayment(paymentId: Text, caller: Principal) : Result.Result<Text, Text> {
            switch (paymentTransactions.get(paymentId)) {
                case null { #err("Payment transaction not found") };
                case (?transaction) {
                    // Verify authorization
                    if (transaction.payerId != caller and transaction.payeeId != caller) {
                        return #err("Unauthorized: Only payment participants can process payments");
                    };
                    
                    if (transaction.status != #pending) {
                        return #err("Payment is not in pending status");
                    };
                    
                    // Update transaction status to processing
                    let processingTransaction = {
                        transaction with status = #processing;
                    };
                    paymentTransactions.put(paymentId, processingTransaction);
                    
                    // Simulate payment processing (in production, integrate with actual payment processors)
                    let completedTransaction = {
                        processingTransaction with
                        status = #completed;
                        completedAt = ?Time.now();
                        transactionHash = ?("hash_" # paymentId);
                    };
                    paymentTransactions.put(paymentId, completedTransaction);
                    
                    #ok("Payment processed successfully")
                };
            };
        };
        
        // Process automatic refund
        public func processAutomaticRefund(
            paymentId: Text,
            refundReason: RefundReason,
            caller: Principal
        ) : Result.Result<Text, Text> {
            switch (paymentTransactions.get(paymentId)) {
                case null { #err("Payment transaction not found") };
                case (?transaction) {
                    // Verify authorization
                    if (transaction.payerId != caller) {
                        return #err("Unauthorized: Only payer can process refunds");
                    };
                    
                    if (transaction.status != #completed) {
                        return #err("Payment must be completed to process refund");
                    };
                    
                    // Check if auto refund is enabled
                    if (not transaction.autoRefundEnabled) {
                        return #err("Automatic refund is not enabled for this transaction");
                    };
                    
                    // Check refund deadline
                    switch (transaction.refundDeadline) {
                        case null { };
                        case (?deadline) {
                            if (Time.now() > deadline) {
                                return #err("Refund deadline has passed");
                            };
                        };
                    };
                    
                    let refundedTransaction = {
                        transaction with
                        status = #refunded;
                        refundedAt = ?Time.now();
                        refundReason = ?refundReason;
                    };
                    paymentTransactions.put(paymentId, refundedTransaction);
                    
                    #ok("Automatic refund processed successfully")
                };
            };
        };
        
        // === ESCROW OPERATIONS ===
        
        // Create escrow contract
        public func createEscrowContract(
            payerId: Principal,
            payeeId: Principal,
            amount: Nat,
            serviceDescription: Text,
            releaseConditions: Text
        ) : Result.Result<Text, Text> {
            let escrowId = generateEscrowId();
            let now = Time.now();
            
            let contract: EscrowContract = {
                id = escrowId;
                payerId = payerId;
                payeeId = payeeId;
                amount = amount;
                serviceDescription = serviceDescription;
                releaseConditions = releaseConditions;
                createdAt = now;
                fundedAt = null;
                releasedAt = null;
                status = #pending;
                disputeReason = null;
                arbitrator = null;
            };
            
            escrowContracts.put(escrowId, contract);
            #ok(escrowId)
        };
        
        // Fund escrow contract
        public func fundEscrowContract(escrowId: Text, caller: Principal) : Result.Result<Text, Text> {
            switch (escrowContracts.get(escrowId)) {
                case null { #err("Escrow contract not found") };
                case (?contract) {
                    if (contract.payerId != caller) {
                        return #err("Unauthorized: Only payer can fund escrow");
                    };
                    
                    if (contract.status != #pending) {
                        return #err("Escrow contract is not in pending status");
                    };
                    
                    let fundedContract = {
                        contract with
                        status = #funded;
                        fundedAt = ?Time.now();
                    };
                    escrowContracts.put(escrowId, fundedContract);
                    
                    #ok("Escrow contract funded successfully")
                };
            };
        };
        
        // Release escrow funds
        public func releaseEscrowFunds(
            escrowId: Text,
            releaseConditionsMet: Bool,
            caller: Principal
        ) : Result.Result<Text, Text> {
            switch (escrowContracts.get(escrowId)) {
                case null { #err("Escrow contract not found") };
                case (?contract) {
                    if (contract.payerId != caller and contract.payeeId != caller) {
                        return #err("Unauthorized: Only contract participants can release funds");
                    };
                    
                    if (contract.status != #funded) {
                        return #err("Escrow contract is not in funded status");
                    };
                    
                    if (not releaseConditionsMet) {
                        return #err("Release conditions not met");
                    };
                    
                    let releasedContract = {
                        contract with
                        status = #released;
                        releasedAt = ?Time.now();
                    };
                    escrowContracts.put(escrowId, releasedContract);
                    
                    #ok("Escrow funds released successfully")
                };
            };
        };
        
        // === PAYMENT PLAN OPERATIONS ===
        
        // Create payment plan
        public func createPaymentPlan(
            payerId: Principal,
            payeeId: Principal,
            totalAmount: Nat,
            installmentAmount: Nat,
            frequency: Text,
            autoPayEnabled: Bool
        ) : Result.Result<Text, Text> {
            let planId = generatePaymentPlanId();
            let now = Time.now();
            
            let remainingInstallments = totalAmount / installmentAmount;
            if (remainingInstallments == 0) {
                return #err("Invalid installment amount");
            };
            
            // Calculate next payment date based on frequency
            let nextPaymentDate = switch (frequency) {
                case ("weekly") { now + (7 * 24 * 3600000000000) };
                case ("monthly") { now + (30 * 24 * 3600000000000) };
                case ("quarterly") { now + (90 * 24 * 3600000000000) };
                case (_) { now + (30 * 24 * 3600000000000) }; // Default to monthly
            };
            
            let plan: PaymentPlan = {
                id = planId;
                payerId = payerId;
                payeeId = payeeId;
                totalAmount = totalAmount;
                installmentAmount = installmentAmount;
                frequency = frequency;
                remainingInstallments = remainingInstallments;
                nextPaymentDate = nextPaymentDate;
                createdAt = now;
                status = #pending;
                autoPayEnabled = autoPayEnabled;
            };
            
            paymentPlans.put(planId, plan);
            #ok(planId)
        };
        
        // Process payment plan installment
        public func processPaymentPlanInstallment(
            planId: Text,
            caller: Principal
        ) : Result.Result<Text, Text> {
            switch (paymentPlans.get(planId)) {
                case null { #err("Payment plan not found") };
                case (?plan) {
                    if (plan.payerId != caller and plan.payeeId != caller) {
                        return #err("Unauthorized: Only plan participants can process installments");
                    };
                    
                    if (plan.status != #pending) {
                        return #err("Payment plan is not active");
                    };
                    
                    if (plan.remainingInstallments == 0) {
                        return #err("Payment plan is already completed");
                    };
                    
                    // Safe subtraction with explicit Int conversion to avoid trap
                    let newRemainingInstallments : Nat = if (plan.remainingInstallments > 0) {
                        Int.abs(Int.sub(plan.remainingInstallments, 1))
                    } else {
                        0
                    };
                    let newStatus = if (newRemainingInstallments == 0) { #completed } else { #pending };
                    
                    // Calculate next payment date
                    let nextPaymentDate = switch (plan.frequency) {
                        case ("weekly") { plan.nextPaymentDate + (7 * 24 * 3600000000000) };
                        case ("monthly") { plan.nextPaymentDate + (30 * 24 * 3600000000000) };
                        case ("quarterly") { plan.nextPaymentDate + (90 * 24 * 3600000000000) };
                        case (_) { plan.nextPaymentDate + (30 * 24 * 3600000000000) };
                    };
                    
                    let updatedPlan = {
                        plan with
                        remainingInstallments = newRemainingInstallments;
                        nextPaymentDate = nextPaymentDate;
                        status = newStatus;
                    };
                    paymentPlans.put(planId, updatedPlan);
                    
                    #ok("Payment plan installment processed successfully")
                };
            };
        };
        
        // === DISPUTE MANAGEMENT ===
        
        // Create payment dispute
        public func createPaymentDispute(
            transactionId: Text,
            disputantId: Principal,
            reason: Text,
            description: Text
        ) : Result.Result<Text, Text> {
            switch (paymentTransactions.get(transactionId)) {
                case null { #err("Payment transaction not found") };
                case (?transaction) {
                    let disputeId = generateDisputeId();
                    let respondentId = if (transaction.payerId == disputantId) {
                        transaction.payeeId
                    } else {
                        transaction.payerId
                    };
                    
                    let dispute: PaymentDispute = {
                        id = disputeId;
                        transactionId = transactionId;
                        disputantId = disputantId;
                        respondentId = respondentId;
                        reason = reason;
                        description = description;
                        status = #open;
                        createdAt = Time.now();
                        resolvedAt = null;
                        resolution = null;
                        arbitrator = null;
                    };
                    
                    paymentDisputes.put(disputeId, dispute);
                    #ok(disputeId)
                };
            };
        };
        
        // Resolve payment dispute
        public func resolvePaymentDispute(
            disputeId: Text,
            resolution: Text,
            arbitrator: Principal
        ) : Result.Result<Text, Text> {
            switch (paymentDisputes.get(disputeId)) {
                case null { #err("Payment dispute not found") };
                case (?dispute) {
                    let resolvedDispute = {
                        dispute with
                        status = #resolved;
                        resolvedAt = ?Time.now();
                        resolution = ?resolution;
                        arbitrator = ?arbitrator;
                    };
                    paymentDisputes.put(disputeId, resolvedDispute);
                    
                    #ok("Payment dispute resolved successfully")
                };
            };
        };
        
        // === QUERY FUNCTIONS ===
        
        // Get payment transaction
        public func getPaymentTransaction(id: Text) : ?PaymentTransaction {
            paymentTransactions.get(id)
        };
        
        // Get user payment transactions
        public func getUserPaymentTransactions(userId: Principal) : [PaymentTransaction] {
            Array.filter<PaymentTransaction>(
                Iter.toArray(paymentTransactions.vals()),
                func(transaction) {
                    transaction.payerId == userId or transaction.payeeId == userId
                }
            )
        };
        
        // Get escrow contract
        public func getEscrowContract(id: Text) : ?EscrowContract {
            escrowContracts.get(id)
        };
        
        // Get user escrow contracts
        public func getUserEscrowContracts(userId: Principal) : [EscrowContract] {
            Array.filter<EscrowContract>(
                Iter.toArray(escrowContracts.vals()),
                func(contract) {
                    contract.payerId == userId or contract.payeeId == userId
                }
            )
        };
        
        // Get payment plan
        public func getPaymentPlan(id: Text) : ?PaymentPlan {
            paymentPlans.get(id)
        };
        
        // Get user payment plans
        public func getUserPaymentPlans(userId: Principal) : [PaymentPlan] {
            Array.filter<PaymentPlan>(
                Iter.toArray(paymentPlans.vals()),
                func(plan) {
                    plan.payerId == userId or plan.payeeId == userId
                }
            )
        };
        
        // Get payment disputes for user
        public func getUserPaymentDisputes(userId: Principal) : [PaymentDispute] {
            Array.filter<PaymentDispute>(
                Iter.toArray(paymentDisputes.vals()),
                func(dispute) {
                    dispute.disputantId == userId or dispute.respondentId == userId
                }
            )
        };
        
        // Get all payment transactions
        public func getAllPaymentTransactions() : [PaymentTransaction] {
            Iter.toArray(paymentTransactions.vals())
        };
        
        // Get all escrow contracts
        public func getAllEscrowContracts() : [EscrowContract] {
            Iter.toArray(escrowContracts.vals())
        };
        
        // Get all payment plans
        public func getAllPaymentPlans() : [PaymentPlan] {
            Iter.toArray(paymentPlans.vals())
        };
        
        // Get all payment disputes
        public func getAllPaymentDisputes() : [PaymentDispute] {
            Iter.toArray(paymentDisputes.vals())
        };
        
        // === STATISTICS AND REPORTING ===
        
        // Get payment statistics
        public func getPaymentStatistics() : PaymentStatistics {
            let allTransactions = Iter.toArray(paymentTransactions.vals());
            let completedTransactions = Array.filter<PaymentTransaction>(
                allTransactions,
                func(t) { t.status == #completed }
            );
            let refundedTransactions = Array.filter<PaymentTransaction>(
                allTransactions,
                func(t) { t.status == #refunded }
            );
            
            let totalPaymentVolume = Array.foldLeft<PaymentTransaction, Nat>(
                completedTransactions,
                0,
                func(acc, t) { acc + t.amount }
            );
            
            let allPlans = Iter.toArray(paymentPlans.vals());
            let activePlans = Array.filter<PaymentPlan>(
                allPlans,
                func(p) { p.status == #pending }
            );
            
            let averageTransactionAmount = if (completedTransactions.size() > 0) {
                totalPaymentVolume / completedTransactions.size()
            } else { 0 };
            
            let successRate = if (allTransactions.size() > 0) {
                Float.fromInt(completedTransactions.size()) / Float.fromInt(allTransactions.size())
            } else { 0.0 };
            
            {
                totalTransactions = allTransactions.size();
                completedTransactions = completedTransactions.size();
                refundedTransactions = refundedTransactions.size();
                totalEscrowContracts = escrowContracts.size();
                activePaymentPlans = activePlans.size();
                totalPaymentVolume = totalPaymentVolume;
                averageTransactionAmount = averageTransactionAmount;
                successRate = successRate;
            }
        };
        
        // === MAINTENANCE FUNCTIONS ===
        
        // Clean up expired transactions and contracts
        public func cleanupExpiredItems() : Nat {
            let now = Time.now();
            let thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1_000_000_000);
            var cleanedCount = 0;
            
            // Clean up old completed transactions
            let transactionEntries = Iter.toArray(paymentTransactions.entries());
            for ((id, transaction) in transactionEntries.vals()) {
                switch (transaction.completedAt) {
                    case null { };
                    case (?completedTime) {
                        if (completedTime < thirtyDaysAgo and transaction.status == #completed) {
                            // Archive instead of delete for audit purposes
                            // In production, move to archive storage
                            cleanedCount += 1;
                        };
                    };
                };
            };
            
            cleanedCount
        };
        
        // === ADDITIONAL UTILITY FUNCTIONS ===
        
        // Cancel payment transaction
        public func cancelPaymentTransaction(paymentId: Text, caller: Principal) : Result.Result<Text, Text> {
            switch (paymentTransactions.get(paymentId)) {
                case null { #err("Payment transaction not found") };
                case (?transaction) {
                    if (transaction.payerId != caller) {
                        return #err("Unauthorized: Only payer can cancel payment");
                    };
                    
                    if (transaction.status != #pending) {
                        return #err("Can only cancel pending payments");
                    };
                    
                    let cancelledTransaction = {
                        transaction with status = #cancelled;
                    };
                    paymentTransactions.put(paymentId, cancelledTransaction);
                    
                    #ok("Payment transaction cancelled successfully")
                };
            };
        };
        
        // Fail payment transaction
        public func failPaymentTransaction(paymentId: Text, _reason: Text) : Result.Result<Text, Text> {
            switch (paymentTransactions.get(paymentId)) {
                case null { #err("Payment transaction not found") };
                case (?transaction) {
                    if (transaction.status != #processing and transaction.status != #pending) {
                        return #err("Payment is not in processable status");
                    };
                    
                    let failedTransaction = {
                        transaction with
                        status = #failed;
                        failedAt = ?Time.now();
                    };
                    paymentTransactions.put(paymentId, failedTransaction);
                    
                    #ok("Payment transaction marked as failed")
                };
            };
        };
        
        // Get current transaction sequence number
        public func getCurrentTransactionSequence() : Nat {
            transactionSequence
        };
        
        // Get system health status
        public func getSystemHealth() : {
            totalActiveTransactions: Nat;
            totalPendingDisputes: Nat;
            systemStatus: Text;
        } {
            let activeTransactions = Array.filter<PaymentTransaction>(
                Iter.toArray(paymentTransactions.vals()),
                func(t) { t.status == #pending or t.status == #processing }
            );
            
            let pendingDisputes = Array.filter<PaymentDispute>(
                Iter.toArray(paymentDisputes.vals()),
                func(d) { d.status == #open or d.status == #under_review }
            );
            
            let systemStatus = if (activeTransactions.size() > 100) {
                "high_load"
            } else if (activeTransactions.size() > 50) {
                "medium_load"
            } else {
                "normal"
            };
            
            {
                totalActiveTransactions = activeTransactions.size();
                totalPendingDisputes = pendingDisputes.size();
                systemStatus = systemStatus;
            }
        };
    };
}