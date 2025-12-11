// src/components/auth/ActivityTracker.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * ActivityTracker component monitors user activity and updates last activity timestamp
 * This helps maintain accurate session timeout tracking
 */
export default function ActivityTracker() {
  const { isAuthenticated, updateLastActivity } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Throttle activity updates to prevent excessive updates
    let lastUpdate = Date.now();
    const UPDATE_INTERVAL = 60000; // Update every 60 seconds

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastUpdate >= UPDATE_INTERVAL) {
        updateLastActivity();
        lastUpdate = now;
      }
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, updateLastActivity]);

  // This component doesn't render anything
  return null;
}
