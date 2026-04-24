import { supabase } from '../lib/supabase';
import { Alert } from '../types';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPushPermissions() {
  if (Platform.OS === 'web') {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }
  
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Expo push token:', token);
  
  // Store token in user profile (simplified)
  // In production, you would save this to Supabase users table
  return token;
}

export async function checkAlertsClientSide(userId: string) {
  console.log('🔔 Checking alerts for user:', userId);
  
  try {
    // Fetch user's active alerts
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true);
    
    if (error) {
      console.error('❌ Error fetching alerts:', error);
      return;
    }
    
    if (!alerts || alerts.length === 0) {
      console.log('📭 No active alerts found');
      return;
    }
    
    console.log(`🔍 Checking ${alerts.length} active alerts`);
    
    // For each alert, check if condition is met
    for (const alert of alerts) {
      await checkSingleAlert(alert);
    }
  } catch (error) {
    console.error('💥 Error in alert checker:', error);
  }
}

async function checkSingleAlert(alert: Alert) {
  try {
    // Check if alert was triggered recently (cooldown)
    const lastTriggered = alert.last_triggered_at ? new Date(alert.last_triggered_at) : null;
    const now = new Date();
    
    if (lastTriggered && (now.getTime() - lastTriggered.getTime()) < 60 * 60 * 1000) {
      // Alert triggered less than 1 hour ago, skip
      return;
    }
    
    // Fetch current market data
    const { data: market, error: marketError } = await supabase
      .from('markets')
      .select('*')
      .eq('id', alert.market_id)
      .single();
    
    if (marketError || !market) {
      console.error(`❌ Market not found for alert ${alert.id}:`, marketError);
      return;
    }
    
    const currentYesPrice = market.yes_price * 100;
    const threshold = alert.threshold_value;
    let conditionMet = false;
    let message = '';
    
    // Check condition based on alert type
    switch (alert.alert_type) {
      case 'price_above':
        conditionMet = currentYesPrice > threshold;
        message = `YES price for "${market.question}" is now ${currentYesPrice.toFixed(1)}%, above your ${threshold}% alert`;
        break;
        
      case 'price_below':
        conditionMet = currentYesPrice < threshold;
        message = `YES price for "${market.question}" is now ${currentYesPrice.toFixed(1)}%, below your ${threshold}% alert`;
        break;
        
      case 'move_24h':
        // Simplified: check if price changed by threshold
        // In production, you would compare with 24h ago price
        const priceChange = Math.random() * 20 - 10; // Simulated change
        conditionMet = Math.abs(priceChange) > threshold;
        message = `"${market.question}" moved ${priceChange.toFixed(1)}% in 24h, exceeding your ${threshold}% alert`;
        break;
        
      case 'whale_trade':
        // Check for recent whale trades
        const { data: whaleTrades } = await supabase
          .from('whale_trades')
          .select('*')
          .eq('market_id', alert.market_id)
          .gte('amount_usd', threshold)
          .gte('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
          .limit(1);
        
        conditionMet = !!(whaleTrades && whaleTrades.length > 0);
        message = `Whale trade of $${threshold}+ detected on "${market.question}"`;
        break;
    }
    
    if (conditionMet) {
      console.log(`✅ Alert condition met: ${message}`);
      
      // Send notification
      await sendNotification(alert.user_id, message, market.id);
      
      // Update last_triggered_at
      await supabase
        .from('alerts')
        .update({ last_triggered_at: new Date().toISOString() })
        .eq('id', alert.id);
    }
  } catch (error) {
    console.error(`💥 Error checking alert ${alert.id}:`, error);
  }
}

async function sendNotification(userId: string, body: string, marketId: string) {
  try {
    // In production, you would:
    // 1. Get user's Expo push token from Supabase
    // 2. Send push notification via Expo server
    
    // For now, show local notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'PolyEdge Alert',
        body,
        data: { marketId, screen: 'market' },
        sound: true,
      },
      trigger: null, // Show immediately
    });
    
    console.log('📱 Local notification sent');
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
}

// Start polling for alerts (client-side)
export function startAlertPolling(userId: string, intervalMinutes = 2) {
  console.log(`⏰ Starting alert polling every ${intervalMinutes} minutes`);
  
  // Initial check
  checkAlertsClientSide(userId);
  
  // Set up interval
  const intervalMs = intervalMinutes * 60 * 1000;
  const intervalId = setInterval(() => {
    checkAlertsClientSide(userId);
  }, intervalMs);
  
  return () => {
    clearInterval(intervalId);
    console.log('🛑 Alert polling stopped');
  };
}