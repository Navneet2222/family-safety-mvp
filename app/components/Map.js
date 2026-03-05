"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';

// THIS IS THE SECRET WEAPON: Dynamically importing the map to prevent Server-Side crashes
const DynamicMap = dynamic(() => import('../../components/Map'), { ssr: false });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ParentDashboard() {
  const [locationLogs, setLocationLogs] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null); 

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('Location_Logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) console.error("Error fetching logs:", error);
    else setLocationLogs(data);
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* LEFT SIDEBAR: The Timeline */}
      <div className="w-1/3 max-w-sm bg-white border-r border-gray-200 flex flex-col z-10 shadow-lg">
        <div className="p-4 bg-blue-600 text-white font-bold text-lg shadow-md">
          Location Timeline
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {locationLogs.map((log) => (
            <div 
              key={log.id} 
              onClick={() => setSelectedLocation({ lat: log.lat, lng: log.lng })}
              className="p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors"
            >
              <div className="font-semibold text-gray-800">
                {formatTime(log.timestamp)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Lat: {log.lat.toFixed(4)}, Lng: {log.lng.toFixed(4)}
              </div>
            </div>
          ))}
          
          {locationLogs.length === 0 && (
            <div className="p-4 text-gray-500 text-center">No location data found.</div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: The Live Map */}
      <div className="flex-1 relative z-0">
        <DynamicMap logs={locationLogs} selectedLocation={selectedLocation} />
      </div>

    </div>
  );
}