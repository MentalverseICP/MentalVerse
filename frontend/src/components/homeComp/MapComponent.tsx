import React from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

interface prop {
  className: string
}

interface MapPoint {
  coordinates: [number, number];
  type: "recovery" | "neutral" | "affected" | "safe";
}

interface CustomGeography {
  rsmKey: string;
  properties: Record<string, any>;
  geometry: Record<string, any>;
}

const data: MapPoint[] = [
  { coordinates: [-99.1332, 19.4326], type: "recovery" },
  { coordinates: [116.4074, 39.9042], type: "neutral" },
  { coordinates: [-0.1276, 51.5074], type: "affected" },
  { coordinates: [144.9631, -37.8136], type: "safe" },

  { coordinates: [34.8516, 31.0461], type: "recovery" },
  { coordinates: [55.2708, 25.2048], type: "neutral" },
  { coordinates: [139.6917, 35.6895], type: "affected" },
  { coordinates: [-46.6333, -23.5505], type: "safe" },

  { coordinates: [151.2093, -33.8688], type: "recovery" },
  { coordinates: [-74.006, 40.7128], type: "neutral" },
  { coordinates: [-58.3816, -34.6037], type: "affected" },
  { coordinates: [2.3522, 48.8566], type: "safe" },

  { coordinates: [12.4964, 41.9028], type: "recovery" },
  { coordinates: [13.405, 52.52], type: "neutral" },
  { coordinates: [28.9784, 41.0082], type: "affected" },
  { coordinates: [-113.7038, 40.4168], type: "safe" },

  { coordinates: [37.6173, 55.7558], type: "recovery" },
  { coordinates: [103.8198, 1.3521], type: "neutral" },
  { coordinates: [100.5018, 13.7563], type: "affected" },
  { coordinates: [18.4241, -33.9249], type: "safe" },

  { coordinates: [144.9465, -37.8409], type: "recovery" },
  { coordinates: [-79.3832, 43.6532], type: "neutral" },
  { coordinates: [-123.1216, 49.2827], type: "affected" },
  { coordinates: [77.209, 28.6139], type: "safe" },

  { coordinates: [-80.1918, 25.7617], type: "recovery" },
  { coordinates: [-43.1729, -22.9068], type: "neutral" },
  { coordinates: [-157.8583, 21.3069], type: "affected" },
  { coordinates: [-118.2437, 34.0522], type: "safe" },

  { coordinates: [-123.3656, 48.4284], type: "recovery" },
  { coordinates: [31.2357, 30.0444], type: "neutral" },
  { coordinates: [35.6895, 51.389], type: "affected" },
  { coordinates: [-71.0589, 42.3601], type: "safe" },

  { coordinates: [36.8219, -1.2921], type: "recovery" },
  { coordinates: [-122.6765, 45.5231], type: "neutral" },
  { coordinates: [135.5022, 34.6937], type: "affected" },
  { coordinates: [114.1095, 22.3964], type: "safe" },

  { coordinates: [10.4515, 51.1657], type: "recovery" },
  { coordinates: [44.4268, 26.1063], type: "neutral" },
  { coordinates: [101.6869, 3.139], type: "affected" },
  { coordinates: [12.5674, 55.6759], type: "safe" },

  { coordinates: [-157.8052, 21.4511], type: "recovery" },
  { coordinates: [-58.4444, -34.6174], type: "neutral" },
  { coordinates: [103.9352, 1.2806], type: "affected" },
  { coordinates: [-157.8581, 21.3083], type: "safe" },

  { coordinates: [88.3639, 22.5726], type: "recovery" },
  { coordinates: [-74.0059, 40.7128], type: "neutral" },
  { coordinates: [139.8395, 35.6528], type: "affected" },
  { coordinates: [126.978, 37.5665], type: "safe" },

  { coordinates: [77.2090, 28.6139], type: "recovery" },
  { coordinates: [-74.0060, 40.7128], type: "neutral" },
  { coordinates: [151.2093, -33.8688], type: "affected" },
  { coordinates: [2.3522, 48.8566], type: "safe" },
  
  { coordinates: [-58.3816, -34.6037], type: "recovery" },
  { coordinates: [39.6917, 325.6895], type: "neutral" },
  { coordinates: [-113.7038, 420.4168], type: "affected" },
  { coordinates: [133.4050, 252.5200], type: "safe" },

  { coordinates: [10.8198, -11.3521], type: "recovery" },
  { coordinates: [-13.1216, 249.2827], type: "neutral" },
  { coordinates: [-37.6173, 155.7558], type: "affected" },
  { coordinates: [122.4964, 41.9028], type: "safe" },

  { coordinates: [-46.6333, -23.5505], type: "recovery" },
  { coordinates: [-122.4194, 37.7749], type: "neutral" },
  { coordinates: [28.9784, 41.0082], type: "affected" },
  { coordinates: [55.2708, 25.2048], type: "safe" },

  { coordinates: [-1.8312, -78.1834], type: "recovery" },
  { coordinates: [24.7536, 59.4370], type: "neutral" },
  { coordinates: [90.4125, 23.8103], type: "affected" },
  { coordinates: [30.0444, 31.2357], type: "safe" },

  { coordinates: [13.405, 52.52], type: "recovery" },
  { coordinates: [80.2707, 13.0827], type: "neutral" },
  { coordinates: [30.0444, 31.2357], type: "affected" },
  { coordinates: [-97.7431, 30.2672], type: "safe" },

  { coordinates: [-77.0369, 38.9072], type: "recovery" },
  { coordinates: [121.4737, 31.2304], type: "neutral" },
  { coordinates: [174.7633, -36.8485], type: "affected" },
  { coordinates: [114.0579, 22.5431], type: "safe" },

  { coordinates: [-1.6169, 54.9783], type: "recovery" },
  { coordinates: [30.5241, 50.4501], type: "neutral" },
  { coordinates: [77.5946, 12.9716], type: "affected" },
  { coordinates: [19.0402, 47.4979], type: "safe" },

  { coordinates: [139.7745, 35.6812], type: "recovery" },
  { coordinates: [-0.1181, 51.5094], type: "neutral" },
  { coordinates: [29.9187, 31.2001], type: "affected" },
  { coordinates: [-73.5673, 45.5017], type: "safe" },

  { coordinates: [6.1296, 49.6117], type: "recovery" },
  { coordinates: [28.6326, 77.2205], type: "neutral" },
  { coordinates: [25.0136, 60.1699], type: "affected" },
  { coordinates: [32.856, -25.9655], type: "safe" },

  { coordinates: [-3.7037, 40.4165], type: "recovery" },
  { coordinates: [44.4287, 26.0896], type: "neutral" },
  { coordinates: [4.899, 52.377], type: "affected" },
  { coordinates: [6.8514, 51.2217], type: "safe" },

  { coordinates: [-85.1376, 42.963], type: "recovery" },
  { coordinates: [100.3293, 5.4149], type: "neutral" },
  { coordinates: [-214.899, 352.377], type: "affected" },
  { coordinates: [62.8514, -430.2217], type: "safe" },
];

const MapComponent: React.FC<prop> = ({className}) => {
  return (
    <div className={`h-full flex flex-row max-sm:flex-col justify-between bg-transparent rounded-3xl shadow-md border overflow-hidden ${className}`}>
      {/* Map Container */}
      <div className="w-fit lg:w-3/4 lg:mb-0 h-full border-r-2 dark:border-[#2f3339] max-sm:border-0 max-lg:pr-36 max-md:pr-6 bg-transparent relative">
      <h2 className=" absolute max-lg:relative uppercase font-bold text-xs max-lg:text-lg px-6 pt-4">covid 19 pandemic</h2>
        <ComposableMap
          className=" w-full h-fit p-4 max-md:p-0 mb-10"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: CustomGeography[] }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  className="fill-blue-200 stroke-gray-300"
                />
              ))
            }
          </Geographies>
          {data.map((point, idx) => (
            <Marker key={idx} coordinates={point.coordinates}>
              <circle
                r={6}
                fill={
                  point.type === "recovery"
                    ? "#127804"
                    : point.type === "neutral"
                    ? "#fbd205"
                    : point.type === "affected"
                    ? "#ff0000"
                    : "#021bff"
                }
                stroke="white"
                strokeWidth={1}
                className="cursor-pointer"
              />
            </Marker>
          ))}
        </ComposableMap>
        <div className=" absolute max-lg:relative -bottom-2 flex flex-wrap gap-2 px-4 pb-6">
          <button type="button" className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full shadow">All</button>
          <button type="button" className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full shadow">USA</button>
          <button type="button" className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full shadow">China</button>
          <button type="button" className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full shadow">Australia</button>
          <button type="button" className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full shadow">UK</button>
          <button type="button" className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full shadow">Botswana</button>
        </div>
      </div>

      {/* Sidebar for Info and Buttons */}
      <ul className="w-fit p-4 space-y-2 text-sm grid items-center max-lg:pr-16 max-md:pr-10 max-sm:flex max-sm:flex-wrap max-sm:justify-between max-sm:gap-3">
        <li className="flex flex-col justify-between">
          <span className="font-bold uppercase text-sm">Recovery Zones</span>
          <span className="text-green-600 font-semibold">12M</span>
          <span className="rounded-md h-1 w-20 bg-green-600" />
        </li>
        <li className="flex flex-col justify-between">
          <span className="font-bold uppercase text-sm">Neutral Zones</span>
          <span className="text-yellow-600 font-semibold">5M</span>
          <span className="rounded-md h-1 w-20 bg-yellow-600" />
        </li>
        <li className="flex flex-col justify-between">
          <span className="font-bold uppercase text-sm">Affected Zones</span>
          <span className="text-[#ff0000] font-semibold">18M</span>
          <span className="rounded-md h-1 w-20 bg-[#ff0000]" />
        </li>
        <li className="flex flex-col justify-between">
          <span className="font-bold uppercase text-sm">Safe Zones</span>
          <span className="text-blue-600 font-semibold">2M</span>
          <span className="rounded-md h-1 w-20 bg-blue-600" />
        </li>
      </ul>
    </div>
  );
};

export default MapComponent;
