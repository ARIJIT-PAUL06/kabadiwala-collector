// Serves: R01, R11
import React from 'react';
import { Stack } from 'expo-router';

export default function SellLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
