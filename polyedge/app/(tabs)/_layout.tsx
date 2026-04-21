import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.tabBarBackground,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTitleStyle: {
          color: Colors.textPrimary,
          fontWeight: '600',
        },
        headerTintColor: Colors.textPrimary,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="flame" size={size} color={color} />
          ),
          headerTitle: 'PolyEdge',
        }}
      />
      <Tabs.Screen
        name="whales"
        options={{
          title: 'Whales',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="fish" size={size} color={color} />
          ),
          headerTitle: 'Whale Feed',
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
          headerTitle: 'My Alerts',
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
          headerTitle: 'Top Traders',
        }}
      />
    </Tabs>
  );
}