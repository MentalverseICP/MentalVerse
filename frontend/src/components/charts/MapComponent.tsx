import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { data } from "../data";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

interface prop {
  className: string;
}

interface CustomGeography {
  rsmKey: string;
  properties: Record<string, any>;
  geometry: Record<string, any>;
}

const MapComponent: React.FC<prop> = ({ className }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>("All");

  const countries = ["All", "USA", "China", "Australia", "UK", "Botswana"];

  // Filter data based on selected country
  const filteredData =
    selectedCountry === "All"
      ? data
      : data.filter(
          (point) =>
            point.country === selectedCountry || point.country === "All"
        );

  // Calculate statistics for filtered data
  const getStats = () => {
    const stats = {
      wellness: 0,
      support: 0,
      crisis: 0,
      therapy: 0
    };

    filteredData.forEach((point) => {
      stats[point.type]++;
    });

    return stats;
  };

  const stats = getStats();

  return (
    <div
      className={`h-full flex flex-row max-sm:flex-col justify-between bg-transparent rounded-3xl shadow-md border overflow-hidden ${className}`}
    >
      {/* Map Container */}
      <div className="w-fit lg:w-3/4 lg:mb-0 h-full border-r-2 dark:border-[#2f3339] max-sm:border-0 max-lg:pr-36 max-md:pr-6 bg-transparent relative">
        <h2 className=" absolute max-lg:relative uppercase font-bold text-xs max-lg:text-md px-6 pt-4">
          Mental Health Support Network - {selectedCountry}
        </h2>
        <ComposableMap className=" w-full h-fit p-4 max-md:p-0 mb-10">
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
          {filteredData.map((point, idx) => (
            <Marker key={idx} coordinates={point.coordinates}>
              <circle
                r={selectedCountry === point.country ? 5 : 5.5}
                fill={
                  point.type === "wellness"
                    ? "#127804"
                    : point.type === "support"
                    ? "#fbd205"
                    : point.type === "crisis"
                    ? "#ff0000"
                    : "#021bff"
                }
                stroke="white"
                strokeWidth={selectedCountry === point.country ? 0.5 : 0.8}
                className="cursor-pointer transition-all duration-200"
                style={{
                  filter:
                    selectedCountry === point.country
                      ? "drop-shadow(0px 0px 4px rgba(0,0,0,0.6))"
                      : "none",
                }}
              />
            </Marker>
          ))}
        </ComposableMap>
        <div className=" absolute max-lg:relative -bottom-2 flex flex-wrap gap-2 px-4 pb-6">
          {countries.map((country) => (
            <button
              key={country}
              type="button"
              onClick={() => setSelectedCountry(country)}
              className={`px-3 py-1 text-xs font-semibold rounded-full shadow transition-all duration-200 hover:scale-105 ${
                selectedCountry === country
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {country}
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar for Info and Buttons */}
      <ul className="w-fit p-4 max-sm:p-3 max-[400px]:p-2 space-y-2 max-sm:space-y-1 text-sm grid items-center max-lg:pr-16 max-md:pr-10 max-sm:pr-0 max-sm:flex max-sm:flex-wrap max-sm:justify-between max-sm:gap-3 max-[400px]:gap-2">
        <li className="flex flex-col justify-between max-sm:min-w-[120px] max-[400px]:min-w-[100px]">
          <span className="font-bold uppercase text-sm max-sm:text-xs max-[400px]:text-[10px]">Wellness Centers</span>
          <span className="text-green-600 font-semibold max-sm:text-sm max-[400px]:text-xs">{stats.wellness}</span>
          <span className="rounded-md h-1 w-20 max-sm:w-16 max-[400px]:w-12 max-sm:h-0.5 bg-green-600" />
        </li>
        <li className="flex flex-col justify-between max-sm:min-w-[120px] max-[400px]:min-w-[100px]">
          <span className="font-bold uppercase text-sm max-sm:text-xs max-[400px]:text-[10px]">Support Groups</span>
          <span className="text-yellow-600 font-semibold max-sm:text-sm max-[400px]:text-xs">{stats.support}</span>
          <span className="rounded-md h-1 w-20 max-sm:w-16 max-[400px]:w-12 max-sm:h-0.5 bg-yellow-600" />
        </li>
        <li className="flex flex-col justify-between max-sm:min-w-[120px] max-[400px]:min-w-[100px]">
          <span className="font-bold uppercase text-sm max-sm:text-xs max-[400px]:text-[10px]">Crisis Centers</span>
          <span className="text-[#ff0000] font-semibold max-sm:text-sm max-[400px]:text-xs">{stats.crisis}</span>
          <span className="rounded-md h-1 w-20 max-sm:w-16 max-[400px]:w-12 max-sm:h-0.5 bg-[#ff0000]" />
        </li>
        <li className="flex flex-col justify-between max-sm:min-w-[120px] max-[400px]:min-w-[100px]">
          <span className="font-bold uppercase text-sm max-sm:text-xs max-[400px]:text-[10px]">Therapy Clinics</span>
          <span className="text-blue-600 font-semibold max-sm:text-sm max-[400px]:text-xs">{stats.therapy}</span>
          <span className="rounded-md h-1 w-20 max-sm:w-16 max-[400px]:w-12 max-sm:h-0.5 bg-blue-600" />
        </li>
      </ul>
    </div>
  );
};

export default MapComponent;
