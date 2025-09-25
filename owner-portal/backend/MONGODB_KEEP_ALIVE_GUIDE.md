# 🚀 MongoDB Keep-Alive Solution

## 📋 Overview

This solution prevents MongoDB Atlas free tier from going to sleep, eliminating 500 errors caused by cluster sleep on Vercel deployments.

## 🔧 What's Implemented

### 1. **Keep-Alive Utility** (`src/utils/keepAlive.ts`)
- `pingMongoDB()` - Executes MongoDB query to keep cluster awake
- `ensureTempCollection()` - Creates temporary collection for keep-alive queries
- `getMongoDBStatus()` - Returns connection status for monitoring

### 2. **Ping Endpoint** (`/test/ping`)
- **URL**: `https://your-domain.vercel.app/test/ping`
- **Method**: GET
- **Purpose**: External monitoring service can call this to keep MongoDB awake
- **Response**: JSON with status, timestamp, and MongoDB connection info

### 3. **Cron Job** (`src/cron/keepAlive.ts`)
- **Schedule**: Every 15 minutes (`*/15 * * * *`)
- **Purpose**: For local development environments
- **Note**: Doesn't work on Vercel serverless (use external monitoring instead)

## 🎯 How It Works

### **Local Development:**
```
Cron Job → Every 15 min → Query MongoDB → Cluster stays awake
```

### **Vercel Production:**
```
UptimeRobot → Every 15 min → Call /test/ping → Query MongoDB → Cluster stays awake
```

## 🚀 Setup Instructions

### **Step 1: Deploy Your Backend**
Your backend is already deployed with the new keep-alive functionality.

### **Step 2: Set Up External Monitoring (UptimeRobot)**

#### **Option A: UptimeRobot (Recommended)**

1. **Sign up**: Go to [UptimeRobot.com](https://uptimerobot.com)
2. **Create Monitor**:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://smarthoster-test-deploy.vercel.app/test/ping`
   - **Monitoring Interval**: 15 minutes
   - **Timeout**: 30 seconds
   - **Alert Contacts**: Add your email

3. **Advanced Settings**:
   - **Keyword**: `"status":"success"` (optional)
   - **Port**: 443 (HTTPS)
   - **Ignore SSL**: No

#### **Option B: Alternative Services**
- **Pingdom**: Similar setup to UptimeRobot
- **StatusCake**: Free tier available
- **Cron-job.org**: Simple cron service
- **EasyCron**: Professional cron service

### **Step 3: Test the Setup**

#### **Test Ping Endpoint:**
```bash
curl https://smarthoster-test-deploy.vercel.app/test/ping
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "MongoDB cluster is awake",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "mongoStatus": {
    "readyState": 1,
    "status": "connected",
    "host": "cluster0.xxxxx.mongodb.net",
    "port": 27017,
    "name": "owner-portal",
    "timestamp": "2025-01-27T10:30:00.000Z"
  },
  "environment": "production"
}
```

## 📊 Monitoring

### **Success Indicators:**
- ✅ Ping endpoint returns `"status":"success"`
- ✅ No more 500 errors after 15+ minutes of inactivity
- ✅ Consistent API performance
- ✅ MongoDB connection status shows `"readyState": 1`

### **Troubleshooting:**
- ❌ **503 Error**: MongoDB not connected
- ❌ **500 Error**: Internal server error
- ❌ **Timeout**: Network issues

## 🔍 How This Solves Your Problem

### **Before (Without Keep-Alive):**
```
15 min inactivity → MongoDB sleeps → First request → 500 error → Second request → Works
```

### **After (With Keep-Alive):**
```
Every 15 min → Ping MongoDB → Cluster stays awake → All requests work consistently
```

## 🎯 Expected Results

- **No more sleep-related 500 errors**
- **Consistent performance like localhost**
- **MongoDB cluster never sleeps**
- **Same behavior as paid MongoDB tier**

## 📝 Notes

- **Free Tier**: This solution works with MongoDB Atlas free tier
- **Paid Tier**: If you upgrade to paid MongoDB, you can disable keep-alive
- **Cost**: UptimeRobot free tier allows 50 monitors
- **Reliability**: External monitoring is more reliable than internal cron on serverless

## 🚨 Important

- **Don't disable**: Keep the external monitoring running
- **Monitor logs**: Check UptimeRobot logs for any failures
- **Backup plan**: Consider upgrading to paid MongoDB for production

---

## 🎉 You're All Set!

Your MongoDB keep-alive solution is now active. The 500 errors caused by cluster sleep should be eliminated within 15 minutes of setting up external monitoring.
