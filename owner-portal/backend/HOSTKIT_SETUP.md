# Hostkit API Setup Guide

## Prerequisites
- Hostkit account with API access
- API key from your Hostkit dashboard
- Property IDs mapped between Hostaway and Hostkit

## Environment Configuration

Add these variables to your `.env` file:

```bash
# Hostkit API Configuration
HOSTKIT_API_URL=https://app.hostkit.pt/api
HOSTKIT_API_KEY=your_hostkit_api_key_here
HOSTAWAY_ACCOUNT_ID=your_hostaway_account_id
```

## API Endpoints

The Hostkit API uses the following endpoints:

- **Base URL**: `https://app.hostkit.pt/api`
- **Protocol**: HTTPS (required)
- **Authentication**: API key via `APIKEY` parameter

## Common Issues & Solutions

### 1. "incorrect protocol" Error
**Cause**: The API endpoint is being called with HTTP instead of HTTPS
**Solution**: Ensure `HOSTKIT_API_URL` starts with `https://`

### 2. API Key Issues
**Cause**: Invalid or expired API key
**Solution**: 
- Verify your API key in Hostkit dashboard
- Check if the key has calendar update permissions
- Ensure the key is for the correct property

### 3. Property ID Mismatch
**Cause**: Using Hostaway property ID instead of Hostkit property ID
**Solution**: Use the property mapping utility in `src/utils/propertyApiKey.ts`

## Testing API Connection

You can test your Hostkit API connection using the test script:

```bash
cd owner-portal/backend
node test.js
```

## Calendar Update Endpoint

The calendar update endpoint expects:
- `APIKEY`: Your Hostkit API key
- `listing_id`: The Hostaway listing ID
- `date_start`: Unix timestamp for start date
- `date_end`: Unix timestamp for end date
- `status`: "blocked" or "available"

## Troubleshooting

1. **Check Network Tab**: Verify the request is going to `https://app.hostkit.pt/api`
2. **Verify API Key**: Test with a simple GET request first
3. **Check CORS**: Ensure your backend can make requests to Hostkit
4. **Property Mapping**: Verify the property ID mapping is correct

## Support

If issues persist:
1. Check Hostkit API documentation
2. Verify your account has calendar update permissions
3. Contact Hostkit support with your API key and error details


