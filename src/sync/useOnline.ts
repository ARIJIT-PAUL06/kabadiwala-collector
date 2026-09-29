// Serves: R12, R16
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useAppStore } from '../store/useAppStore';

/**
 * Checks if the device is currently online, respecting the
 * "Simulate offline" setting for demos/testing.
 */
export function getIsOnline(): boolean {
  if (useAppStore.getState().simulateOffline) {
    return false;
  }
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return true;
}

/**
 * React hook that subscribes to network status changes and respects simulateOffline.
 */
export function useOnline(): { isOnline: boolean } {
  const simulateOffline = useAppStore((state) => state.simulateOffline);
  const [networkOnline, setNetworkOnline] = useState<boolean>(() => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleOnline = () => setNetworkOnline(true);
      const handleOffline = () => setNetworkOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const isOnline = simulateOffline ? false : networkOnline;

  return { isOnline };
}
