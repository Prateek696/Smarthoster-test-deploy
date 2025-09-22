# Hostaway API Setup Guide

## Overview
This guide explains how to set up the real Hostaway API integration for the Owner Portal calendar functionality.

## Prerequisites
1. Hostaway account with API access
2. API token/credentials from Hostaway
3. Property listing IDs

## Environment Configuration

### 1. Create `.env` file
Copy `env.example` to `.env` and fill in your Hostaway credentials:

```bash
cp env.example .env
```

### 2. Configure Hostaway API
Edit `.env` and set:

```env
# Hostaway API Configuration
HOSTAWAY_TOKEN=your_actual_hostaway_api_token_here
HOSTAWAY_BASE_URL=https://api.hostaway.com/v1
```

## Getting Your Hostaway API Token

### Step 1: Access Hostaway Dashboard
1. Log in to your Hostaway account
2. Navigate to **Settings** → **API**
3. Generate a new API token or copy existing one

### Step 2: API Permissions
Ensure your API token has these permissions:
- `listings:read` - Read property listings
- `calendar:read` - Read calendar availability
- `calendar:write` - Update calendar (block/unblock dates)
- `reservations:read` - Read booking data

### Step 3: Test API Access
Test your token with a simple API call:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://api.hostaway.com/v1/listings"
```

## Current Implementation

### Real API + Fallback System
The system now works with a **hybrid approach**:

1. **Primary**: Attempts to use real Hostaway API
2. **Fallback**: If API fails, stores blocked dates locally
3. **Visual**: Blocked dates are displayed with **gray background and border**

### How It Works
1. When you block/unblock dates, the system:
   - First tries to update Hostaway API
   - If successful: Updates are synced to Hostaway
   - If failed: Falls back to local storage
   
2. Blocked dates are visually indicated with:
   - **Gray background** (`bg-gray-200`)
   - **Gray border** (`border-2 border-gray-400`)
   - **Gray text** (`text-gray-700`)

## Testing the Integration

### 1. Start Backend
```bash
cd owner-portal/backend
npm run dev
```

### 2. Check Console Logs
Look for these messages:
- ✅ `"Hostaway calendar updated successfully"` - Real API working
- ⚠️ `"Hostaway calendar update failed, falling back to mock"` - Using fallback
- 📝 `"Mock calendar updated for listing X"` - Local storage working

### 3. Test Calendar
1. Navigate to `/calendar` page
2. Select dates and click "Block Dates"
3. Check if dates appear with gray styling
4. Verify backend console logs

## Troubleshooting

### Common Issues

#### 1. "HOSTAWAY_TOKEN environment variable is not set"
**Solution**: Create `.env` file with your token

#### 2. "401 Unauthorized" Error
**Solution**: Check if your API token is valid and has correct permissions

#### 3. "404 Not Found" Error
**Solution**: Verify your listing ID exists in Hostaway

#### 4. Calendar Updates Not Persisting
**Solution**: Check if you're using mock mode (look for "mock: true" in logs)

### Debug Mode
The system includes extensive logging. Check backend console for:
- API request details
- Response data
- Error messages
- Fallback activation

## Migration from Mock to Real

### Current State
- ✅ Calendar renders properly
- ✅ Block/unblock functionality works
- ✅ Visual indicators for blocked dates
- ✅ Fallback system ensures reliability

### Next Steps
1. **Get Hostaway API credentials**
2. **Configure environment variables**
3. **Test real API integration**
4. **Remove mock fallback** (optional)

## Benefits of Real Integration

1. **Real-time Sync**: Changes appear immediately in Hostaway
2. **Multi-platform**: Updates sync across all booking platforms
3. **Professional**: No data loss between sessions
4. **Scalable**: Works with multiple properties

## Support

If you encounter issues:
1. Check backend console logs
2. Verify API credentials
3. Test API endpoints manually
4. Check Hostaway API documentation

---

**Note**: The mock system ensures the calendar works even without API access, making development and testing easier.


