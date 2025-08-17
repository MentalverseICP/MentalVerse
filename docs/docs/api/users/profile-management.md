---
sidebar_position: 1
---

# Profile Management

MentalVerse provides comprehensive profile management APIs that support both standard and anonymous user profiles while maintaining the highest privacy and security standards for mental health data.

## Profile Types

### Standard Profiles
Linked to wallet identities with full platform access:

```javascript
{
  "user_id": "user_123",
  "principal": "rdmx6-jaaaa-aaaah-qcaiq-cai",
  "profile_type": "standard",
  "display_name": "Alex M.",
  "avatar_url": "https://api.mentalverse.com/avatars/user_123.svg",
  "bio": "Mental health advocate and peer supporter",
  "location": {
    "country": "US",
    "timezone": "America/New_York"
  },
  "preferences": {
    "language": "en",
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": false,
      "in_app": true
    }
  },
  "privacy_settings": {
    "profile_visibility": "community",
    "show_online_status": false,
    "allow_direct_messages": true
  },
  "verification": {
    "email_verified": true,
    "phone_verified": false,
    "identity_verified": false
  },
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-20T14:30:00Z"
}
```

### Anonymous Profiles
Zero-knowledge profiles for maximum privacy:

```javascript
{
  "anonymous_id": "anon_abc123",
  "profile_type": "anonymous",
  "display_name": "Anonymous User",
  "avatar_seed": "deterministic_seed_123",
  "preferences": {
    "language": "en",
    "theme": "dark"
  },
  "zk_proof": "proof_xyz789",
  "session_data": {
    "created_at": "2024-01-15T10:00:00Z",
    "expires_at": "2024-01-15T14:00:00Z"
  },
  "privacy_level": "maximum"
}
```

### Professional Profiles
For licensed mental health professionals:

```javascript
{
  "user_id": "prof_456",
  "professional_id": "lic_789",
  "profile_type": "professional",
  "display_name": "Dr. Sarah Johnson, LCSW",
  "credentials": [
    {
      "type": "license",
      "credential": "LCSW",
      "state": "NY",
      "number": "012345",
      "verified": true,
      "expires_at": "2025-12-31T23:59:59Z"
    }
  ],
  "specializations": [
    "anxiety",
    "depression",
    "trauma",
    "adolescent_therapy"
  ],
  "practice_info": {
    "practice_name": "Mindful Healing Center",
    "address": {
      "city": "New York",
      "state": "NY",
      "country": "US"
    },
    "insurance_accepted": ["Aetna", "BlueCross", "Cigna"],
    "session_rates": {
      "individual": 150,
      "group": 75,
      "currency": "USD"
    }
  },
  "availability": {
    "timezone": "America/New_York",
    "schedule": {
      "monday": ["09:00-17:00"],
      "tuesday": ["09:00-17:00"],
      "wednesday": ["09:00-17:00"],
      "thursday": ["09:00-17:00"],
      "friday": ["09:00-15:00"]
    }
  },
  "verification": {
    "background_check": true,
    "license_verified": true,
    "insurance_verified": true
  }
}
```

## API Endpoints

### Get Profile

```http
GET /api/users/profile
Authorization: Bearer <session_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user_123",
    "display_name": "Alex M.",
    "avatar_url": "https://api.mentalverse.com/avatars/user_123.svg",
    "bio": "Mental health advocate and peer supporter",
    "preferences": {
      "language": "en",
      "theme": "dark"
    }
  }
}
```

### Update Profile

```http
PUT /api/users/profile
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "display_name": "Alex Martinez",
  "bio": "Mental health advocate, peer supporter, and wellness coach",
  "preferences": {
    "theme": "light",
    "notifications": {
      "email": false,
      "push": true
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user_123",
    "display_name": "Alex Martinez",
    "bio": "Mental health advocate, peer supporter, and wellness coach",
    "updated_at": "2024-01-20T15:45:00Z"
  }
}
```

### Upload Avatar

```http
POST /api/users/profile/avatar
Content-Type: multipart/form-data
Authorization: Bearer <session_token>

{
  "avatar": <file_data>,
  "crop_data": {
    "x": 10,
    "y": 10,
    "width": 200,
    "height": 200
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "avatar_url": "https://api.mentalverse.com/avatars/user_123_v2.svg",
    "thumbnail_url": "https://api.mentalverse.com/avatars/user_123_thumb.svg"
  }
}
```

### Delete Profile

```http
DELETE /api/users/profile
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "confirmation": "DELETE_MY_PROFILE",
  "reason": "no_longer_needed",
  "data_retention": {
    "anonymize_messages": true,
    "delete_therapy_notes": false,
    "export_data": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deletion_id": "del_123456",
    "scheduled_deletion": "2024-02-01T00:00:00Z",
    "export_url": "https://api.mentalverse.com/exports/user_123_export.zip",
    "export_expires": "2024-01-25T23:59:59Z"
  }
}
```

## Privacy Settings Management

### Get Privacy Settings

```http
GET /api/users/profile/privacy
Authorization: Bearer <session_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profile_visibility": "community",
    "show_online_status": false,
    "allow_direct_messages": true,
    "data_sharing": {
      "analytics": false,
      "research": true,
      "marketing": false
    },
    "search_visibility": {
      "by_username": true,
      "by_email": false,
      "by_phone": false
    },
    "activity_visibility": {
      "last_seen": "friends",
      "group_participation": "members",
      "therapy_sessions": "private"
    }
  }
}
```

### Update Privacy Settings

```http
PUT /api/users/profile/privacy
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "profile_visibility": "private",
  "allow_direct_messages": false,
  "data_sharing": {
    "analytics": false,
    "research": false
  }
}
```

## Anonymous Profile Management

### Create Anonymous Profile

```http
POST /api/users/anonymous
Content-Type: application/json

{
  "zk_proof": "proof_xyz789",
  "preferences": {
    "language": "en",
    "theme": "dark"
  },
  "session_duration": 14400
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "anonymous_id": "anon_abc123",
    "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "avatar_seed": "deterministic_seed_123",
    "expires_at": "2024-01-15T14:00:00Z"
  }
}
```

### Update Anonymous Preferences

```http
PUT /api/users/anonymous/preferences
Content-Type: application/json
Authorization: Bearer <anonymous_session_token>

{
  "language": "es",
  "theme": "light"
}
```

## Professional Profile Management

### Submit Professional Verification

```http
POST /api/users/professional/verification
Content-Type: multipart/form-data
Authorization: Bearer <session_token>

{
  "license_type": "LCSW",
  "license_number": "012345",
  "license_state": "NY",
  "license_document": <file_data>,
  "background_check": <file_data>,
  "malpractice_insurance": <file_data>
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "verification_id": "ver_789",
    "status": "pending",
    "estimated_completion": "2024-01-22T17:00:00Z",
    "required_documents": [
      "license_document",
      "background_check",
      "malpractice_insurance"
    ],
    "submitted_documents": [
      "license_document",
      "background_check",
      "malpractice_insurance"
    ]
  }
}
```

### Update Professional Information

```http
PUT /api/users/professional/info
Content-Type: application/json
Authorization: Bearer <professional_session_token>

{
  "specializations": ["anxiety", "depression", "trauma", "couples_therapy"],
  "practice_info": {
    "practice_name": "Mindful Healing Center",
    "session_rates": {
      "individual": 175,
      "group": 85
    }
  },
  "availability": {
    "schedule": {
      "monday": ["09:00-17:00"],
      "tuesday": ["09:00-17:00"],
      "wednesday": ["09:00-17:00"],
      "thursday": ["09:00-17:00"],
      "friday": ["09:00-15:00"],
      "saturday": ["10:00-14:00"]
    }
  }
}
```

## Client-Side Implementation

### Profile Manager Class

```javascript
class ProfileManager {
  constructor(apiClient) {
    this.api = apiClient;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }
  
  async getProfile(useCache = true) {
    const cacheKey = 'current_profile';
    
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }
    
    const response = await this.api.get('/users/profile');
    
    if (response.success) {
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  async updateProfile(updates) {
    const response = await this.api.put('/users/profile', updates);
    
    if (response.success) {
      // Invalidate cache
      this.cache.delete('current_profile');
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  async uploadAvatar(file, cropData = null) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    if (cropData) {
      formData.append('crop_data', JSON.stringify(cropData));
    }
    
    const response = await this.api.post('/users/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.success) {
      // Invalidate cache
      this.cache.delete('current_profile');
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  async getPrivacySettings() {
    const response = await this.api.get('/users/profile/privacy');
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  async updatePrivacySettings(settings) {
    const response = await this.api.put('/users/profile/privacy', settings);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
  
  async deleteProfile(confirmation) {
    if (confirmation.confirmation !== 'DELETE_MY_PROFILE') {
      throw new Error('Invalid confirmation string');
    }
    
    const response = await this.api.delete('/users/profile', confirmation);
    
    if (response.success) {
      // Clear all cached data
      this.cache.clear();
      return response.data;
    }
    
    throw new Error(response.error.message);
  }
}
```

### React Profile Component

```jsx
import React, { useState, useEffect } from 'react';
import { useSession } from '../hooks/useSession';
import { ProfileManager } from '../services/ProfileManager';

const ProfileSettings = () => {
  const { session, sessionManager } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileManager] = useState(new ProfileManager(sessionManager.apiClient));
  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await profileManager.getProfile();
        setProfile(profileData);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (session?.valid) {
      loadProfile();
    }
  }, [session, profileManager]);
  
  const handleUpdateProfile = async (updates) => {
    setSaving(true);
    try {
      const updatedProfile = await profileManager.updateProfile(updates);
      setProfile(prev => ({ ...prev, ...updatedProfile }));
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Show error notification
    } finally {
      setSaving(false);
    }
  };
  
  const handleAvatarUpload = async (file) => {
    try {
      const result = await profileManager.uploadAvatar(file);
      setProfile(prev => ({
        ...prev,
        avatar_url: result.avatar_url
      }));
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }
  
  return (
    <div className="profile-settings">
      <h2>Profile Settings</h2>
      
      <div className="avatar-section">
        <img 
          src={profile.avatar_url} 
          alt="Profile Avatar" 
          className="avatar-preview"
        />
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => handleAvatarUpload(e.target.files[0])}
        />
      </div>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        handleUpdateProfile({
          display_name: formData.get('display_name'),
          bio: formData.get('bio')
        });
      }}>
        <div className="form-group">
          <label htmlFor="display_name">Display Name</label>
          <input 
            type="text" 
            id="display_name" 
            name="display_name"
            defaultValue={profile.display_name}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea 
            id="bio" 
            name="bio"
            defaultValue={profile.bio}
            rows={4}
          />
        </div>
        
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;
```

## Data Validation

### Profile Validation Schema

```javascript
const profileValidationSchema = {
  display_name: {
    type: 'string',
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_.]+$/,
    required: true
  },
  bio: {
    type: 'string',
    maxLength: 500,
    sanitize: true
  },
  location: {
    type: 'object',
    properties: {
      country: {
        type: 'string',
        enum: ['US', 'CA', 'UK', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE']
      },
      timezone: {
        type: 'string',
        pattern: /^[A-Za-z]+\/[A-Za-z_]+$/
      }
    }
  },
  preferences: {
    type: 'object',
    properties: {
      language: {
        type: 'string',
        enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja']
      },
      theme: {
        type: 'string',
        enum: ['light', 'dark', 'auto']
      },
      notifications: {
        type: 'object',
        properties: {
          email: { type: 'boolean' },
          push: { type: 'boolean' },
          in_app: { type: 'boolean' }
        }
      }
    }
  }
};

const validateProfile = (profileData) => {
  const errors = [];
  
  // Validate display name
  if (!profileData.display_name || profileData.display_name.length < 2) {
    errors.push('Display name must be at least 2 characters long');
  }
  
  if (profileData.display_name && profileData.display_name.length > 50) {
    errors.push('Display name must be less than 50 characters');
  }
  
  // Validate bio
  if (profileData.bio && profileData.bio.length > 500) {
    errors.push('Bio must be less than 500 characters');
  }
  
  // Validate email format if provided
  if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
    errors.push('Invalid email format');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
```

## Error Handling

### Profile Error Types

```javascript
const PROFILE_ERRORS = {
  VALIDATION_FAILED: 'validation_failed',
  AVATAR_TOO_LARGE: 'avatar_too_large',
  AVATAR_INVALID_FORMAT: 'avatar_invalid_format',
  DISPLAY_NAME_TAKEN: 'display_name_taken',
  INSUFFICIENT_PERMISSIONS: 'insufficient_permissions',
  PROFILE_NOT_FOUND: 'profile_not_found',
  VERIFICATION_REQUIRED: 'verification_required'
};

const handleProfileError = (error) => {
  switch (error.code) {
    case PROFILE_ERRORS.VALIDATION_FAILED:
      return {
        message: 'Please check your input and try again',
        details: error.validation_errors
      };
      
    case PROFILE_ERRORS.AVATAR_TOO_LARGE:
      return {
        message: 'Avatar file size must be less than 5MB',
        action: 'compress_image'
      };
      
    case PROFILE_ERRORS.DISPLAY_NAME_TAKEN:
      return {
        message: 'This display name is already taken',
        suggestions: error.suggested_names
      };
      
    case PROFILE_ERRORS.VERIFICATION_REQUIRED:
      return {
        message: 'Email verification required to update profile',
        action: 'verify_email'
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

Explore other API documentation:
- [Authentication](/docs/api/auth/overview)
- [Session Management](/docs/api/auth/session-management)
- [Therapy Booking](/docs/api/therapy/booking)
- [Token Economics](/docs/api/tokens/economics)