---
sidebar_position: 1
---

# Therapy Session Booking

MentalVerse's therapy booking system provides a comprehensive API for scheduling, managing, and conducting therapy sessions with licensed mental health professionals. The system supports individual therapy, group therapy, crisis interventions, and specialized sessions.

## Session Types

### Individual Therapy Sessions

```javascript
{
  "session_id": "sess_individual_123",
  "session_type": "individual",
  "therapist_id": "prof_456",
  "client_id": "user_789",
  "duration": 50,
  "scheduled_at": "2024-01-25T14:00:00Z",
  "timezone": "America/New_York",
  "session_format": "video",
  "specialization": "anxiety",
  "status": "confirmed",
  "payment_status": "paid",
  "room_url": "https://therapy.mentalverse.com/room/sess_individual_123",
  "preparation_materials": [
    {
      "type": "questionnaire",
      "title": "Pre-session Anxiety Assessment",
      "url": "/assessments/anxiety-pre-session"
    }
  ],
  "notes": {
    "client_notes": "Feeling anxious about work presentation",
    "therapist_notes": "Continue CBT techniques for presentation anxiety"
  },
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-01-22T16:30:00Z"
}
```

### Group Therapy Sessions

```javascript
{
  "session_id": "sess_group_456",
  "session_type": "group",
  "therapist_id": "prof_456",
  "group_id": "group_anxiety_support",
  "participants": [
    {
      "user_id": "user_789",
      "display_name": "Alex M.",
      "status": "confirmed"
    },
    {
      "user_id": "user_101",
      "display_name": "Jordan K.",
      "status": "confirmed"
    }
  ],
  "max_participants": 8,
  "current_participants": 6,
  "duration": 90,
  "scheduled_at": "2024-01-26T18:00:00Z",
  "session_format": "video",
  "group_theme": "Managing Workplace Anxiety",
  "status": "confirmed",
  "room_url": "https://therapy.mentalverse.com/group/sess_group_456",
  "group_guidelines": [
    "Maintain confidentiality",
    "Respect others' sharing time",
    "Use 'I' statements",
    "No advice-giving unless requested"
  ]
}
```

### Crisis Intervention Sessions

```javascript
{
  "session_id": "sess_crisis_789",
  "session_type": "crisis",
  "therapist_id": "prof_crisis_123",
  "client_id": "user_789",
  "priority": "high",
  "duration": 60,
  "scheduled_at": "2024-01-20T15:30:00Z",
  "session_format": "video",
  "crisis_level": "moderate",
  "status": "in_progress",
  "room_url": "https://therapy.mentalverse.com/crisis/sess_crisis_789",
  "safety_plan": {
    "created": true,
    "emergency_contacts": [
      {
        "name": "Emergency Contact",
        "phone": "+1-555-0123",
        "relationship": "family"
      }
    ],
    "coping_strategies": [
      "Deep breathing exercises",
      "Call crisis hotline: 988",
      "Reach out to support person"
    ]
  },
  "follow_up_required": true,
  "follow_up_scheduled": "2024-01-21T10:00:00Z"
}
```

## Booking Workflow

### 1. Search Available Therapists

```http
GET /api/therapy/therapists/search
Authorization: Bearer <session_token>

?specialization=anxiety
&session_type=individual
&date_range=2024-01-25,2024-02-01
&timezone=America/New_York
&insurance=Aetna
&language=en
```

**Response:**
```json
{
  "success": true,
  "data": {
    "therapists": [
      {
        "therapist_id": "prof_456",
        "display_name": "Dr. Sarah Johnson, LCSW",
        "specializations": ["anxiety", "depression", "trauma"],
        "rating": 4.9,
        "total_sessions": 1250,
        "languages": ["en", "es"],
        "session_rates": {
          "individual": 150,
          "group": 75
        },
        "insurance_accepted": ["Aetna", "BlueCross"],
        "next_available": "2024-01-25T14:00:00Z",
        "available_slots": [
          {
            "start_time": "2024-01-25T14:00:00Z",
            "end_time": "2024-01-25T14:50:00Z",
            "session_type": "individual"
          },
          {
            "start_time": "2024-01-25T15:00:00Z",
            "end_time": "2024-01-25T15:50:00Z",
            "session_type": "individual"
          }
        ]
      }
    ],
    "total_results": 15,
    "page": 1,
    "per_page": 10
  }
}
```

### 2. Get Therapist Availability

```http
GET /api/therapy/therapists/prof_456/availability
Authorization: Bearer <session_token>

?start_date=2024-01-25
&end_date=2024-02-01
&session_type=individual
```

**Response:**
```json
{
  "success": true,
  "data": {
    "therapist_id": "prof_456",
    "timezone": "America/New_York",
    "availability": {
      "2024-01-25": [
        {
          "start_time": "09:00",
          "end_time": "09:50",
          "available": true,
          "session_type": "individual"
        },
        {
          "start_time": "14:00",
          "end_time": "14:50",
          "available": true,
          "session_type": "individual"
        },
        {
          "start_time": "15:00",
          "end_time": "15:50",
          "available": false,
          "reason": "booked"
        }
      ],
      "2024-01-26": [
        {
          "start_time": "10:00",
          "end_time": "10:50",
          "available": true,
          "session_type": "individual"
        }
      ]
    }
  }
}
```

### 3. Create Booking Request

```http
POST /api/therapy/sessions/book
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "therapist_id": "prof_456",
  "session_type": "individual",
  "scheduled_at": "2024-01-25T14:00:00Z",
  "duration": 50,
  "timezone": "America/New_York",
  "session_format": "video",
  "specialization": "anxiety",
  "reason_for_session": "Work-related anxiety and stress management",
  "preferred_approach": "CBT",
  "insurance_info": {
    "provider": "Aetna",
    "member_id": "123456789",
    "group_number": "ABC123"
  },
  "emergency_contact": {
    "name": "Jane Doe",
    "phone": "+1-555-0123",
    "relationship": "spouse"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "sess_individual_123",
    "booking_status": "pending_confirmation",
    "scheduled_at": "2024-01-25T14:00:00Z",
    "therapist_confirmation_required": true,
    "estimated_confirmation_time": "2024-01-20T12:00:00Z",
    "payment_required": true,
    "payment_amount": 150,
    "payment_deadline": "2024-01-24T14:00:00Z",
    "cancellation_policy": {
      "free_cancellation_until": "2024-01-24T14:00:00Z",
      "cancellation_fee_after": 75
    }
  }
}
```

### 4. Confirm and Pay for Session

```http
POST /api/therapy/sessions/sess_individual_123/confirm
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "payment_method": "mvt_tokens",
  "mvt_amount": 150,
  "backup_payment": {
    "method": "credit_card",
    "card_token": "card_token_123"
  },
  "consent": {
    "therapy_agreement": true,
    "privacy_policy": true,
    "cancellation_policy": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "sess_individual_123",
    "status": "confirmed",
    "payment_status": "paid",
    "payment_transaction_id": "txn_789",
    "room_url": "https://therapy.mentalverse.com/room/sess_individual_123",
    "room_access_code": "SECURE123",
    "preparation_materials": [
      {
        "type": "questionnaire",
        "title": "Pre-session Anxiety Assessment",
        "url": "/assessments/anxiety-pre-session",
        "due_date": "2024-01-25T13:00:00Z"
      }
    ],
    "calendar_invite": {
      "ics_url": "/api/therapy/sessions/sess_individual_123/calendar.ics",
      "google_calendar_url": "https://calendar.google.com/calendar/render?action=TEMPLATE&..."
    }
  }
}
```

## Session Management

### Get Session Details

```http
GET /api/therapy/sessions/sess_individual_123
Authorization: Bearer <session_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "sess_individual_123",
    "session_type": "individual",
    "therapist": {
      "therapist_id": "prof_456",
      "display_name": "Dr. Sarah Johnson, LCSW",
      "specializations": ["anxiety", "depression"]
    },
    "scheduled_at": "2024-01-25T14:00:00Z",
    "duration": 50,
    "status": "confirmed",
    "room_url": "https://therapy.mentalverse.com/room/sess_individual_123",
    "preparation_completed": false,
    "can_reschedule": true,
    "can_cancel": true,
    "reschedule_deadline": "2024-01-24T14:00:00Z",
    "cancellation_deadline": "2024-01-24T14:00:00Z"
  }
}
```

### Reschedule Session

```http
PUT /api/therapy/sessions/sess_individual_123/reschedule
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "new_scheduled_at": "2024-01-26T15:00:00Z",
  "reason": "Schedule conflict"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "sess_individual_123",
    "old_scheduled_at": "2024-01-25T14:00:00Z",
    "new_scheduled_at": "2024-01-26T15:00:00Z",
    "status": "rescheduled",
    "therapist_confirmation_required": true,
    "confirmation_deadline": "2024-01-21T12:00:00Z"
  }
}
```

### Cancel Session

```http
DELETE /api/therapy/sessions/sess_individual_123
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "reason": "Personal emergency",
  "request_refund": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "sess_individual_123",
    "status": "cancelled",
    "cancellation_fee": 0,
    "refund_amount": 150,
    "refund_method": "mvt_tokens",
    "refund_processing_time": "immediate",
    "refund_transaction_id": "refund_456"
  }
}
```

## Group Therapy Management

### Join Group Therapy

```http
POST /api/therapy/groups/group_anxiety_support/join
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "session_id": "sess_group_456",
  "consent": {
    "group_guidelines": true,
    "confidentiality_agreement": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "sess_group_456",
    "group_id": "group_anxiety_support",
    "participant_status": "confirmed",
    "room_url": "https://therapy.mentalverse.com/group/sess_group_456",
    "group_guidelines": [
      "Maintain confidentiality",
      "Respect others' sharing time",
      "Use 'I' statements"
    ],
    "other_participants": 5,
    "session_materials": [
      {
        "type": "worksheet",
        "title": "Anxiety Coping Strategies",
        "url": "/materials/anxiety-coping-worksheet.pdf"
      }
    ]
  }
}
```

### Leave Group Session

```http
POST /api/therapy/groups/group_anxiety_support/leave
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "session_id": "sess_group_456",
  "reason": "Schedule conflict"
}
```

## Crisis Intervention

### Request Crisis Session

```http
POST /api/therapy/crisis/request
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "crisis_level": "high",
  "immediate_danger": false,
  "description": "Experiencing severe anxiety and panic attacks",
  "preferred_therapist": "prof_456",
  "contact_method": "video",
  "emergency_contact": {
    "name": "Jane Doe",
    "phone": "+1-555-0123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "sess_crisis_789",
    "priority": "high",
    "estimated_wait_time": 300,
    "assigned_therapist": {
      "therapist_id": "prof_crisis_123",
      "display_name": "Dr. Michael Chen, LCSW",
      "specializations": ["crisis_intervention", "trauma"]
    },
    "room_url": "https://therapy.mentalverse.com/crisis/sess_crisis_789",
    "crisis_resources": [
      {
        "name": "National Suicide Prevention Lifeline",
        "phone": "988",
        "available": "24/7"
      },
      {
        "name": "Crisis Text Line",
        "text": "HOME to 741741",
        "available": "24/7"
      }
    ],
    "immediate_coping_strategies": [
      "Take slow, deep breaths",
      "Ground yourself using 5-4-3-2-1 technique",
      "Call emergency services if in immediate danger"
    ]
  }
}
```

## Client-Side Implementation

### Therapy Booking Manager

```javascript
class TherapyBookingManager {
  constructor(apiClient) {
    this.api = apiClient;
    this.cache = new Map();
  }
  
  async searchTherapists(criteria) {
    const queryParams = new URLSearchParams(criteria);
    const response = await this.api.get(`/therapy/therapists/search?${queryParams}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  async getTherapistAvailability(therapistId, startDate, endDate, sessionType = 'individual') {
    const cacheKey = `availability_${therapistId}_${startDate}_${endDate}_${sessionType}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
        return cached.data;
      }
    }
    
    const response = await this.api.get(
      `/therapy/therapists/${therapistId}/availability`,
      {
        params: {
          start_date: startDate,
          end_date: endDate,
          session_type: sessionType
        }
      }
    );
    
    if (response.success) {
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  async bookSession(bookingData) {
    const response = await this.api.post('/therapy/sessions/book', bookingData);
    
    if (response.success) {
      // Clear availability cache
      this.clearAvailabilityCache(bookingData.therapist_id);
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  async confirmSession(sessionId, confirmationData) {
    const response = await this.api.post(
      `/therapy/sessions/${sessionId}/confirm`,
      confirmationData
    );
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  async getSession(sessionId) {
    const response = await this.api.get(`/therapy/sessions/${sessionId}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  async rescheduleSession(sessionId, newDateTime, reason) {
    const response = await this.api.put(
      `/therapy/sessions/${sessionId}/reschedule`,
      {
        new_scheduled_at: newDateTime,
        reason
      }
    );
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  async cancelSession(sessionId, reason, requestRefund = true) {
    const response = await this.api.delete(
      `/therapy/sessions/${sessionId}`,
      {
        data: {
          reason,
          request_refund: requestRefund
        }
      }
    );
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  async requestCrisisSession(crisisData) {
    const response = await this.api.post('/therapy/crisis/request', crisisData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  clearAvailabilityCache(therapistId) {
    for (const [key] of this.cache) {
      if (key.includes(`availability_${therapistId}`)) {
        this.cache.delete(key);
      }
    }
  }
}
```

### React Booking Component

```jsx
import React, { useState, useEffect } from 'react';
import { TherapyBookingManager } from '../services/TherapyBookingManager';
import { useSession } from '../hooks/useSession';

const TherapyBooking = () => {
  const { session, sessionManager } = useSession();
  const [bookingManager] = useState(new TherapyBookingManager(sessionManager.apiClient));
  const [step, setStep] = useState('search'); // search, select, book, confirm
  const [therapists, setTherapists] = useState([]);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const searchTherapists = async (criteria) => {
    setLoading(true);
    try {
      const results = await bookingManager.searchTherapists(criteria);
      setTherapists(results.therapists);
      setStep('select');
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const selectTherapist = async (therapist) => {
    setSelectedTherapist(therapist);
    setLoading(true);
    
    try {
      const availability = await bookingManager.getTherapistAvailability(
        therapist.therapist_id,
        new Date().toISOString().split('T')[0],
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      );
      
      setSelectedTherapist({
        ...therapist,
        availability: availability.availability
      });
      setStep('book');
    } catch (error) {
      console.error('Failed to load availability:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const bookSession = async (bookingData) => {
    setLoading(true);
    try {
      const result = await bookingManager.bookSession({
        therapist_id: selectedTherapist.therapist_id,
        scheduled_at: selectedSlot.start_time,
        ...bookingData
      });
      
      setBooking(result);
      setStep('confirm');
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const confirmBooking = async (confirmationData) => {
    setLoading(true);
    try {
      const result = await bookingManager.confirmSession(
        booking.session_id,
        confirmationData
      );
      
      setBooking(result);
      // Redirect to session details or dashboard
    } catch (error) {
      console.error('Confirmation failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="therapy-booking">
      {step === 'search' && (
        <TherapistSearch onSearch={searchTherapists} />
      )}
      
      {step === 'select' && (
        <TherapistList 
          therapists={therapists} 
          onSelect={selectTherapist}
          onBack={() => setStep('search')}
        />
      )}
      
      {step === 'book' && (
        <BookingForm 
          therapist={selectedTherapist}
          onBook={bookSession}
          onSlotSelect={setSelectedSlot}
          selectedSlot={selectedSlot}
          onBack={() => setStep('select')}
        />
      )}
      
      {step === 'confirm' && (
        <BookingConfirmation 
          booking={booking}
          onConfirm={confirmBooking}
          onBack={() => setStep('book')}
        />
      )}
    </div>
  );
};

export default TherapyBooking;
```

## Error Handling

### Booking Error Types

```javascript
const BOOKING_ERRORS = {
  SLOT_UNAVAILABLE: 'slot_unavailable',
  THERAPIST_UNAVAILABLE: 'therapist_unavailable',
  PAYMENT_FAILED: 'payment_failed',
  INSUFFICIENT_TOKENS: 'insufficient_tokens',
  INSURANCE_VERIFICATION_FAILED: 'insurance_verification_failed',
  BOOKING_LIMIT_EXCEEDED: 'booking_limit_exceeded',
  CANCELLATION_DEADLINE_PASSED: 'cancellation_deadline_passed'
};

const handleBookingError = (error) => {
  switch (error.code) {
    case BOOKING_ERRORS.SLOT_UNAVAILABLE:
      return {
        message: 'This time slot is no longer available',
        action: 'select_different_slot',
        suggested_slots: error.alternative_slots
      };
      
    case BOOKING_ERRORS.PAYMENT_FAILED:
      return {
        message: 'Payment could not be processed',
        action: 'retry_payment',
        details: error.payment_error
      };
      
    case BOOKING_ERRORS.INSUFFICIENT_TOKENS:
      return {
        message: 'Insufficient MVT tokens for this session',
        action: 'purchase_tokens',
        required_amount: error.required_tokens,
        current_balance: error.current_balance
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
- [User Profile Management](../users/profile-management)
- [Token Economics](../tokens/economics)
- [API Introduction](../introduction)