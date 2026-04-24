# Alert Checker Edge Function

This Supabase Edge Function would run every 2 minutes via Supabase cron to check active alerts.

## Functionality
1. SELECT all active alerts from alerts table
2. For each alert fetch current market price from Polymarket
3. If condition met AND last_triggered_at > 1 hour ago:
   - POST to https://exp.host/--/api/v2/push/send
   - UPDATE last_triggered_at = NOW()

## Current Status
Skipped due to permissions. Using client-side polling instead.

See: `services/alertPolling.ts` for client-side implementation.