'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function BlackBoxTracker() {
  const [status, setStatus] = useState('Initializing...');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
        setIsOnline(true);
        syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    const locationInterval = setInterval(() => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const payload = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              timestamp: new Date().toISOString(),
            };
            
            if (navigator.onLine) {
              sendToCloud(payload);
            } else {
              saveLocally(payload);
            }
          },
          (error) => setStatus('Error: Location permissions denied.')
        );
      }
    }, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(locationInterval);
    };
  }, []);

  const saveLocally = (data) => {
    const existingData = JSON.parse(localStorage.getItem('blackBoxLogs')) || [];
    existingData.push(data);
    localStorage.setItem('blackBoxLogs', JSON.stringify(existingData));
    setStatus(`Offline. Saved ${existingData.length} logs locally.`);
  };

  const sendToCloud = async (data) => {
    const { error } = await supabase
      .from('Location_Logs')
      .insert([data]);

    if (error) {
      console.error('Error sending to cloud:', error);
      setStatus('Error syncing with database.');
    } else {
      setStatus(`Online. Live location tracked at ${new Date(data.timestamp).toLocaleTimeString()}`);
    }
  };

  const syncOfflineData = async () => {
    const offlineData = JSON.parse(localStorage.getItem('blackBoxLogs')) || [];
    if (offlineData.length > 0) {
      setStatus(`Syncing ${offlineData.length} offline logs to the cloud...`);
      
      const { error } = await supabase
        .from('Location_Logs')
        .insert(offlineData);

      if (!error) {
        localStorage.removeItem('blackBoxLogs');
        setStatus('Offline data successfully synced to cloud.');
      } else {
        console.error('Error syncing offline data:', error);
      }
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white text-black max-w-sm text-center">
      <h2 className="text-xl font-bold mb-2">Engine Status</h2>
      <p className="font-semibold mb-2">Network: {isOnline ? '🟢 Online' : '🔴 Offline'}</p>
      <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">{status}</p>
    </div>
  );
}