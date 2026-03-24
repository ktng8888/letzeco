import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import useAuthStore from '../store/authStore';
import { useRouter, useSegments } from 'expo-router';

export default function RootLayout() {
  const { isAuthenticated, initialize } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false); // ← add this line

  useEffect(() => {
    initialize().then(() => setIsReady(true)); // ← update this
  }, []);

  useEffect(() => {

    if (!isReady) return; // ← wait until mounted

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not logged in — redirect to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Logged in — redirect to home
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, segments]);

    // show blank screen while checking token
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark"/>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="screens" />
      </Stack>
    </>
  );
}