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
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="flame" size={size} color={color} />
          ),
          headerTitle: 'Daily Picks',
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          title: 'Markets',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
          headerTitle: 'Market Intelligence',
        }}
      />
      <Tabs.Screen
        name="whales"
        options={{
          title: 'Whales',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="fish" size={size} color={color} />
          ),
          headerTitle: 'Smart Money',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          headerTitle: 'My Profile',
        }}
      />
    </Tabs>
  );
}