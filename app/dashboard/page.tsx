"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';

interface LocationLog {
  id: number;
  lat: number;
  lng: number;
  timestamp: string;
}

interface SelectedLocation {
  lat: number;
  lng: number;
}

const DynamicMap = dynamic(() => import('../components/Map'), { ssr: false });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ParentDashboard() {
  const [locationLogs, setLocationLogs] = useState<LocationLog[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null); 

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('Location_Logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) console.error("Error fetching logs:", error);
    else setLocationLogs(data as LocationLog[]);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString();
  };

  return (
    // This 'flex h-screen w-full' forces the split-screen layout
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      
      {/* LEFT SIDEBAR: The Timeline */}
      <div className="w-1/3 max-w-sm bg-white border-r border-gray-300 flex flex-col z-10 shadow-2xl">
        <div className="p-5 bg-blue-600 text-white shadow-md">
          <h1 className="font-bold text-xl">Command Center</h1>
          <p className="text-sm text-blue-100">Location Timeline</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {locationLogs.map((log) => (
            <div 
              key={log.id} 
              onClick={() => setSelectedLocation({ lat: log.lat, lng: log.lng })}
              // Dynamic CSS: Highlights the box blue if it is currently selected
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                selectedLocation?.lat === log.lat && selectedLocation?.lng === log.lng 
                ? 'bg-blue-100 border-l-4 border-blue-600' 
                : 'hover:bg-gray-50'
              }`}
            >
              <div className="font-bold text-gray-800">
                {formatDate(log.timestamp)} at {formatTime(log.timestamp)}
              </div>
              <div className="text-xs text-gray-500 mt-1 font-mono">
                Lat: {log.lat.toFixed(4)}, Lng: {log.lng.toFixed(4)}
              </div>
            </div>
          ))}
          
          {locationLogs.length === 0 && (
            <div className="p-4 text-gray-500 text-center flex items-center justify-center h-full">
              Waiting for target location data...
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: The Live Map */}
      <div className="flex-1 relative z-0 h-full w-full">
        <DynamicMap logs={locationLogs} selectedLocation={selectedLocation} />
      </div>

    </div>
  );
}