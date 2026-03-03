'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import dynamic from 'next/dynamic';

// 1. We create a blueprint so TypeScript knows what to expect
interface LocationLog {
  lat: number;
  lng: number;
  timestamp: string;
}

// We dynamically import the map to prevent Server-Side Rendering errors
const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Dashboard() {
  // 2. We tell useState to expect an array of our LocationLog blueprint
  const [locations, setLocations] = useState<LocationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    // Pull data from Supabase, newest first
    const { data, error } = await supabase
      .from('Location_Logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (!error && data) {
      setLocations(data);
    } else {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Parent Command Center</h1>
          <button 
            onClick={fetchLocations}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
          >
            Refresh Data
          </button>
        </header>

        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
          {loading ? (
            <p className="text-center py-10 text-gray-500">Loading tracking data...</p>
          ) : locations.length > 0 ? (
            <Map locations={locations as any} /> 
          ) : (
            <p className="text-center py-10 text-gray-500">No location data found in the cloud vault yet.</p>
          )}
        </div>

        {/* Text Log for easy reading */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Raw Location Logs</h2>
          <ul className="divide-y divide-gray-200">
            {locations.map((loc, idx) => (
              <li key={idx} className="py-3 flex justify-between">
                <span className="text-sm font-mono text-gray-600">
                  Lat: {loc.lat.toFixed(4)}, Lng: {loc.lng.toFixed(4)}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(loc.timestamp).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}