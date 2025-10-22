# Smarthoster Keep-Alive Service

This service keeps MongoDB and auth services alive by pinging them regularly.

## What it does:
- Pings MongoDB keep-alive endpoint every 15 minutes
- Pings auth OTP service to keep it active
- Prevents services from going to sleep

## Deployment on Render:
1. Create a new "Cron Job" on Render
2. Connect this repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Set schedule: `*/15 * * * *` (every 15 minutes)

## Environment Variables:
No environment variables needed - uses public endpoints.

## Free Tier:
- Render cron jobs are free
- Runs every 15 minutes
- No time limits
