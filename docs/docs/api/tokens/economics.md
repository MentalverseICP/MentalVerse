---
sidebar_position: 1
---

# Token Economics

MentalVerse Token (MVT) is the native utility token that powers the MentalVerse ecosystem. This API documentation covers token management, earning mechanisms, spending options, and the overall tokenomics that incentivize positive mental health behaviors and community participation.

## Token Overview

### MVT Token Properties

```javascript
{
  "token_symbol": "MVT",
  "token_name": "MentalVerse Token",
  "blockchain": "Internet Computer",
  "token_standard": "ICRC-1",
  "total_supply": 1000000000,
  "circulating_supply": 250000000,
  "decimals": 8,
  "canister_id": "rdmx6-jaaaa-aaaah-qcaiq-cai",
  "current_price_usd": 0.15,
  "market_cap_usd": 37500000,
  "utility_functions": [
    "therapy_payments",
    "premium_features",
    "governance_voting",
    "staking_rewards",
    "community_incentives"
  ]
}
```

### Token Distribution

```javascript
{
  "distribution": {
    "community_rewards": {
      "percentage": 40,
      "amount": 400000000,
      "description": "Rewards for platform participation and mental health activities"
    },
    "ecosystem_development": {
      "percentage": 25,
      "amount": 250000000,
      "description": "Platform development and professional network expansion"
    },
    "team_and_advisors": {
      "percentage": 15,
      "amount": 150000000,
      "vesting_period": "4 years",
      "cliff": "1 year"
    },
    "treasury": {
      "percentage": 10,
      "amount": 100000000,
      "description": "Platform operations and emergency fund"
    },
    "liquidity_provision": {
      "percentage": 10,
      "amount": 100000000,
      "description": "DEX liquidity and market making"
    }
  }
}
```

## Token Balance and Wallet Management

### Get Token Balance

```http
GET /api/tokens/balance
Authorization: Bearer <session_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user_123",
    "principal": "rdmx6-jaaaa-aaaah-qcaiq-cai",
    "balances": {
      "available": 1250.75000000,
      "staked": 500.00000000,
      "locked": 100.00000000,
      "pending_rewards": 25.50000000
    },
    "total_balance": 1876.25000000,
    "usd_value": 281.44,
    "last_updated": "2024-01-20T15:30:00Z"
  }
}
```

### Get Transaction History

```http
GET /api/tokens/transactions
Authorization: Bearer <session_token>

?limit=50
&offset=0
&type=all
&start_date=2024-01-01
&end_date=2024-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transaction_id": "txn_123456",
        "type": "earn",
        "category": "daily_checkin",
        "amount": 5.00000000,
        "description": "Daily mental health check-in completed",
        "timestamp": "2024-01-20T10:00:00Z",
        "status": "completed",
        "block_height": 1234567
      },
      {
        "transaction_id": "txn_123457",
        "type": "spend",
        "category": "therapy_session",
        "amount": -150.00000000,
        "description": "Individual therapy session with Dr. Sarah Johnson",
        "timestamp": "2024-01-19T14:00:00Z",
        "status": "completed",
        "session_id": "sess_individual_123",
        "block_height": 1234550
      },
      {
        "transaction_id": "txn_123458",
        "type": "earn",
        "category": "peer_support",
        "amount": 15.00000000,
        "description": "Provided peer support in anxiety support group",
        "timestamp": "2024-01-18T18:30:00Z",
        "status": "completed",
        "group_id": "group_anxiety_support",
        "block_height": 1234520
      }
    ],
    "total_transactions": 156,
    "page": 1,
    "per_page": 50
  }
}
```

## Token Earning Mechanisms

### Daily Activities

```javascript
{
  "daily_activities": {
    "mental_health_checkin": {
      "reward": 5,
      "description": "Complete daily mood and wellness assessment",
      "max_per_day": 1,
      "streak_bonus": {
        "7_days": 10,
        "30_days": 50,
        "90_days": 200
      }
    },
    "meditation_session": {
      "reward": 8,
      "description": "Complete guided meditation (minimum 10 minutes)",
      "max_per_day": 3,
      "duration_bonus": {
        "20_minutes": 2,
        "30_minutes": 5
      }
    },
    "journal_entry": {
      "reward": 6,
      "description": "Write reflective journal entry (minimum 100 words)",
      "max_per_day": 2,
      "quality_bonus": {
        "detailed": 3,
        "insightful": 5
      }
    },
    "exercise_log": {
      "reward": 7,
      "description": "Log physical activity or exercise",
      "max_per_day": 2,
      "intensity_bonus": {
        "moderate": 2,
        "vigorous": 4
      }
    }
  }
}
```

### Community Participation

```javascript
{
  "community_activities": {
    "peer_support_message": {
      "reward": 3,
      "description": "Provide supportive message in community forums",
      "max_per_day": 10,
      "quality_multiplier": {
        "helpful_votes": 1.5,
        "expert_recognition": 2.0
      }
    },
    "group_session_participation": {
      "reward": 20,
      "description": "Actively participate in peer support group session",
      "max_per_day": 2,
      "leadership_bonus": 10
    },
    "mentorship_session": {
      "reward": 25,
      "description": "Provide or receive mentorship session",
      "max_per_day": 1,
      "role_multiplier": {
        "mentor": 1.5,
        "mentee": 1.0
      }
    },
    "content_creation": {
      "reward": 50,
      "description": "Create educational content or resources",
      "max_per_week": 3,
      "engagement_bonus": {
        "high_engagement": 25,
        "viral_content": 100
      }
    }
  }
}
```

### Professional Services

```javascript
{
  "professional_earnings": {
    "therapy_session_individual": {
      "base_rate": 150,
      "description": "Conduct individual therapy session",
      "quality_bonus": {
        "high_rating": 15,
        "excellent_rating": 30
      },
      "specialization_bonus": {
        "trauma": 20,
        "addiction": 25,
        "crisis_intervention": 35
      }
    },
    "group_therapy_session": {
      "base_rate": 75,
      "description": "Facilitate group therapy session",
      "participant_bonus": 5,
      "max_participants": 12
    },
    "crisis_intervention": {
      "base_rate": 200,
      "description": "Provide crisis intervention services",
      "urgency_bonus": {
        "immediate": 50,
        "emergency": 100
      }
    },
    "assessment_completion": {
      "base_rate": 100,
      "description": "Complete comprehensive mental health assessment",
      "complexity_bonus": {
        "standard": 0,
        "complex": 25,
        "specialized": 50
      }
    }
  }
}
```

## Token Spending Options

### Therapy and Professional Services

```http
GET /api/tokens/spending/therapy
Authorization: Bearer <session_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "therapy_services": {
      "individual_therapy": {
        "cost": 150,
        "duration": 50,
        "description": "One-on-one therapy session with licensed professional",
        "discount_tiers": {
          "regular_client": 0.05,
          "premium_member": 0.10,
          "community_leader": 0.15
        }
      },
      "group_therapy": {
        "cost": 75,
        "duration": 90,
        "description": "Group therapy session (6-12 participants)",
        "early_bird_discount": 0.10
      },
      "crisis_support": {
        "cost": 200,
        "duration": 60,
        "description": "Immediate crisis intervention support",
        "emergency_access": true
      },
      "assessment": {
        "cost": 100,
        "duration": 90,
        "description": "Comprehensive mental health assessment",
        "includes_report": true
      }
    }
  }
}
```

### Premium Features

```http
GET /api/tokens/spending/premium
Authorization: Bearer <session_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "premium_features": {
      "advanced_ai_companion": {
        "cost": 50,
        "billing_cycle": "monthly",
        "description": "Access to advanced AI therapy companion with personalized insights",
        "features": [
          "24/7 availability",
          "Personalized coping strategies",
          "Mood pattern analysis",
          "Crisis detection"
        ]
      },
      "priority_booking": {
        "cost": 25,
        "billing_cycle": "monthly",
        "description": "Priority access to therapist booking and scheduling",
        "benefits": [
          "Book sessions 2 weeks in advance",
          "Priority waitlist placement",
          "Flexible rescheduling"
        ]
      },
      "advanced_analytics": {
        "cost": 30,
        "billing_cycle": "monthly",
        "description": "Detailed mental health analytics and progress tracking",
        "includes": [
          "Mood trend analysis",
          "Goal progress tracking",
          "Personalized insights",
          "Export capabilities"
        ]
      },
      "private_groups": {
        "cost": 100,
        "billing_cycle": "one_time",
        "description": "Create and manage private support groups",
        "features": [
          "Up to 20 members",
          "Custom group settings",
          "Moderation tools",
          "Private messaging"
        ]
      }
    }
  }
}
```

### Marketplace and Rewards

```http
GET /api/tokens/spending/marketplace
Authorization: Bearer <session_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "marketplace_items": {
      "wellness_courses": {
        "mindfulness_mastery": {
          "cost": 200,
          "description": "8-week mindfulness and meditation course",
          "instructor": "Dr. Jane Smith, PhD",
          "duration": "8 weeks",
          "includes_certificate": true
        },
        "anxiety_management": {
          "cost": 150,
          "description": "Comprehensive anxiety management program",
          "format": "self_paced",
          "modules": 12
        }
      },
      "digital_resources": {
        "guided_meditations": {
          "cost": 25,
          "description": "Premium guided meditation library (100+ sessions)",
          "categories": ["sleep", "anxiety", "focus", "healing"]
        },
        "workbooks": {
          "cost": 15,
          "description": "Interactive digital workbooks for various mental health topics",
          "formats": ["PDF", "interactive"]
        }
      },
      "physical_rewards": {
        "wellness_box": {
          "cost": 500,
          "description": "Curated wellness box with self-care items",
          "shipping": "included",
          "frequency": "quarterly"
        },
        "therapy_journal": {
          "cost": 75,
          "description": "Premium leather-bound therapy journal",
          "customization": "available"
        }
      }
    }
  }
}
```

## Staking and Governance

### Stake Tokens

```http
POST /api/tokens/stake
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "amount": 500.00000000,
  "staking_period": "90_days",
  "auto_restake": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stake_id": "stake_123456",
    "amount_staked": 500.00000000,
    "staking_period": "90_days",
    "apy": 12.5,
    "expected_rewards": 15.62500000,
    "stake_start_date": "2024-01-20T15:30:00Z",
    "stake_end_date": "2024-04-19T15:30:00Z",
    "auto_restake": true,
    "early_withdrawal_penalty": 0.10
  }
}
```

### Get Staking Information

```http
GET /api/tokens/staking/info
Authorization: Bearer <session_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_staked": 500.00000000,
    "active_stakes": [
      {
        "stake_id": "stake_123456",
        "amount": 500.00000000,
        "period": "90_days",
        "apy": 12.5,
        "start_date": "2024-01-20T15:30:00Z",
        "end_date": "2024-04-19T15:30:00Z",
        "accrued_rewards": 8.75000000,
        "status": "active"
      }
    ],
    "total_rewards_earned": 125.50000000,
    "available_staking_options": {
      "30_days": {
        "apy": 8.0,
        "minimum_stake": 100
      },
      "90_days": {
        "apy": 12.5,
        "minimum_stake": 250
      },
      "180_days": {
        "apy": 18.0,
        "minimum_stake": 500
      },
      "365_days": {
        "apy": 25.0,
        "minimum_stake": 1000
      }
    }
  }
}
```

### Governance Voting

```http
GET /api/tokens/governance/proposals
Authorization: Bearer <session_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "active_proposals": [
      {
        "proposal_id": "prop_123",
        "title": "Increase Therapy Session Rewards",
        "description": "Proposal to increase MVT rewards for completing therapy sessions from 5 to 8 tokens",
        "proposer": "user_456",
        "voting_power_required": 1000000,
        "current_votes": {
          "yes": 750000,
          "no": 150000,
          "abstain": 50000
        },
        "voting_ends": "2024-01-30T23:59:59Z",
        "status": "active",
        "user_vote": null,
        "user_voting_power": 500
      }
    ],
    "completed_proposals": [
      {
        "proposal_id": "prop_122",
        "title": "Add New Meditation Categories",
        "result": "passed",
        "final_votes": {
          "yes": 1200000,
          "no": 300000
        },
        "implementation_date": "2024-02-01T00:00:00Z"
      }
    ]
  }
}
```

### Vote on Proposal

```http
POST /api/tokens/governance/vote
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "proposal_id": "prop_123",
  "vote": "yes",
  "voting_power": 500
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "proposal_id": "prop_123",
    "user_vote": "yes",
    "voting_power_used": 500,
    "vote_timestamp": "2024-01-20T15:30:00Z",
    "transaction_id": "vote_txn_789",
    "updated_vote_totals": {
      "yes": 750500,
      "no": 150000,
      "abstain": 50000
    }
  }
}
```

## Token Transfer and Payments

### Transfer Tokens

```http
POST /api/tokens/transfer
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "recipient": "user_456",
  "amount": 100.00000000,
  "memo": "Thank you for the peer support!",
  "transfer_type": "tip"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "txn_transfer_123",
    "from": "user_123",
    "to": "user_456",
    "amount": 100.00000000,
    "fee": 0.01000000,
    "net_amount": 99.99000000,
    "memo": "Thank you for the peer support!",
    "timestamp": "2024-01-20T15:30:00Z",
    "block_height": 1234567,
    "status": "completed"
  }
}
```

### Process Payment

```http
POST /api/tokens/payment
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "service_type": "therapy_session",
  "service_id": "sess_individual_123",
  "amount": 150.00000000,
  "discount_code": "FIRST_SESSION_10",
  "payment_method": "mvt_tokens"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_id": "pay_123456",
    "service_type": "therapy_session",
    "service_id": "sess_individual_123",
    "original_amount": 150.00000000,
    "discount_applied": 15.00000000,
    "final_amount": 135.00000000,
    "payment_method": "mvt_tokens",
    "transaction_id": "txn_payment_789",
    "timestamp": "2024-01-20T15:30:00Z",
    "status": "completed",
    "receipt_url": "/api/tokens/receipts/pay_123456"
  }
}
```

## Client-Side Implementation

### Token Manager Class

```javascript
class TokenManager {
  constructor(apiClient) {
    this.api = apiClient;
    this.balanceCache = null;
    this.cacheTimeout = 30000; // 30 seconds
  }
  
  async getBalance(useCache = true) {
    if (useCache && this.balanceCache) {
      const now = Date.now();
      if (now - this.balanceCache.timestamp < this.cacheTimeout) {
        return this.balanceCache.data;
      }
    }
    
    const response = await this.api.get('/tokens/balance');
    
    if (response.success) {
      this.balanceCache = {
        data: response.data,
        timestamp: Date.now()
      };
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  async getTransactionHistory(options = {}) {
    const params = new URLSearchParams({
      limit: options.limit || 50,
      offset: options.offset || 0,
      type: options.type || 'all',
      ...options
    });
    
    const response = await this.api.get(`/tokens/transactions?${params}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  async stakeTokens(amount, period, autoRestake = false) {
    const response = await this.api.post('/tokens/stake', {
      amount,
      staking_period: period,
      auto_restake: autoRestake
    });
    
    if (response.success) {
      this.invalidateBalanceCache();
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  async transferTokens(recipient, amount, memo = '', transferType = 'transfer') {
    const response = await this.api.post('/tokens/transfer', {
      recipient,
      amount,
      memo,
      transfer_type: transferType
    });
    
    if (response.success) {
      this.invalidateBalanceCache();
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  async processPayment(serviceType, serviceId, amount, options = {}) {
    const response = await this.api.post('/tokens/payment', {
      service_type: serviceType,
      service_id: serviceId,
      amount,
      ...options
    });
    
    if (response.success) {
      this.invalidateBalanceCache();
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  async getGovernanceProposals() {
    const response = await this.api.get('/tokens/governance/proposals');
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  async voteOnProposal(proposalId, vote, votingPower) {
    const response = await this.api.post('/tokens/governance/vote', {
      proposal_id: proposalId,
      vote,
      voting_power: votingPower
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  invalidateBalanceCache() {
    this.balanceCache = null;
  }
  
  formatTokenAmount(amount, decimals = 2) {
    return Number(amount).toFixed(decimals);
  }
  
  calculateUSDValue(tokenAmount, pricePerToken) {
    return (tokenAmount * pricePerToken).toFixed(2);
  }
}
```

### React Token Dashboard

```jsx
import React, { useState, useEffect } from 'react';
import { TokenManager } from '../services/TokenManager';
import { useSession } from '../hooks/useSession';

const TokenDashboard = () => {
  const { session, sessionManager } = useSession();
  const [tokenManager] = useState(new TokenManager(sessionManager.apiClient));
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadTokenData = async () => {
      try {
        const [balanceData, transactionData] = await Promise.all([
          tokenManager.getBalance(),
          tokenManager.getTransactionHistory({ limit: 10 })
        ]);
        
        setBalance(balanceData);
        setTransactions(transactionData.transactions);
      } catch (error) {
        console.error('Failed to load token data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (session?.valid) {
      loadTokenData();
    }
  }, [session, tokenManager]);
  
  const handleStakeTokens = async (amount, period) => {
    try {
      await tokenManager.stakeTokens(amount, period, true);
      // Refresh balance
      const newBalance = await tokenManager.getBalance(false);
      setBalance(newBalance);
    } catch (error) {
      console.error('Staking failed:', error);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading token data...</div>;
  }
  
  return (
    <div className="token-dashboard">
      <div className="balance-section">
        <h2>MVT Balance</h2>
        <div className="balance-card">
          <div className="total-balance">
            <span className="amount">{tokenManager.formatTokenAmount(balance.total_balance)}</span>
            <span className="symbol">MVT</span>
            <span className="usd-value">${balance.usd_value}</span>
          </div>
          
          <div className="balance-breakdown">
            <div className="balance-item">
              <span className="label">Available</span>
              <span className="value">{tokenManager.formatTokenAmount(balance.balances.available)}</span>
            </div>
            <div className="balance-item">
              <span className="label">Staked</span>
              <span className="value">{tokenManager.formatTokenAmount(balance.balances.staked)}</span>
            </div>
            <div className="balance-item">
              <span className="label">Pending Rewards</span>
              <span className="value">{tokenManager.formatTokenAmount(balance.balances.pending_rewards)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        <div className="transaction-list">
          {transactions.map(tx => (
            <div key={tx.transaction_id} className={`transaction-item ${tx.type}`}>
              <div className="transaction-info">
                <span className="description">{tx.description}</span>
                <span className="timestamp">{new Date(tx.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="transaction-amount">
                <span className={`amount ${tx.type}`}>
                  {tx.type === 'earn' ? '+' : ''}{tokenManager.formatTokenAmount(tx.amount)} MVT
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="actions">
        <button onClick={() => handleStakeTokens(100, '90_days')}>
          Stake Tokens
        </button>
        <button onClick={() => window.location.href = '/tokens/marketplace'}>
          Visit Marketplace
        </button>
        <button onClick={() => window.location.href = '/tokens/governance'}>
          Governance
        </button>
      </div>
    </div>
  );
};

export default TokenDashboard;
```

## Error Handling

### Token Error Types

```javascript
const TOKEN_ERRORS = {
  INSUFFICIENT_BALANCE: 'insufficient_balance',
  INVALID_AMOUNT: 'invalid_amount',
  TRANSFER_FAILED: 'transfer_failed',
  STAKING_MINIMUM_NOT_MET: 'staking_minimum_not_met',
  VOTING_POWER_INSUFFICIENT: 'voting_power_insufficient',
  PROPOSAL_VOTING_CLOSED: 'proposal_voting_closed'
};

const handleTokenError = (error) => {
  switch (error.code) {
    case TOKEN_ERRORS.INSUFFICIENT_BALANCE:
      return {
        message: 'Insufficient MVT balance for this transaction',
        action: 'earn_more_tokens',
        required_amount: error.required_amount,
        current_balance: error.current_balance
      };
      
    case TOKEN_ERRORS.STAKING_MINIMUM_NOT_MET:
      return {
        message: `Minimum staking amount is ${error.minimum_amount} MVT`,
        action: 'adjust_amount'
      };
      
    case TOKEN_ERRORS.VOTING_POWER_INSUFFICIENT:
      return {
        message: 'Insufficient voting power for this proposal',
        action: 'stake_more_tokens',
        required_power: error.required_power
      };
      
    default:
      return {
        message: 'An unexpected error occurred',
        action: 'retry'
      };
  }
};
```

## Next Steps

- [Authentication Overview](../auth/overview)
- [Therapy Booking](../therapy/booking)
- [User Profile Management](../users/profile-management)
- [API Introduction](../introduction)