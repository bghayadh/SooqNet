import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,  // This hides the header
        animation: "slide_from_right", // Shein-like animation on both platforms
      }}
    />
  );
}