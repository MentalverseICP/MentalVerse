import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { motion } from "framer-motion";
import { useTheme } from "@/components/shared/theme-provider";
import { data } from "../data";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

interface prop {
  className: string;
}

interface CustomGeography {
  rsmKey: string;
  properties: Record<string, unknown>;
  geometry: Record<string, unknown>;
}

const MapComponent: React.FC<prop> = ({ className }) => {
  const { theme } = useTheme();
  const [selectedCountry, setSelectedCountry] = useState<string>("All");

  const countries = ["All", "USA", "China", "Australia", "UK", "Botswana"];

  const filteredData =
    selectedCountry === "All"
      ? data
      : data.filter(
          (point) =>
            point.country === selectedCountry || point.country === "All"
        );

  const getStats = () => {
    const stats = {
      wellness: 0,
      support: 0,
      crisis: 0,
      therapy: 0,
    };

    filteredData.forEach((point) => {
      stats[point.type]++;
    });

    return stats;
  };

  const stats = getStats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className={`relative h-full flex flex-row max-sm:flex-col justify-between rounded-3xl max-sm:p-2 overflow-hidden ${className}`}
    >
      {/* Glassmorphic background */}
      <div
        className={`absolute inset-0 ${
          theme === "dark" ? "bg-[#0B0B0C]/80" : "bg-white/80"
        } backdrop-blur-xl`}
      />

      {/* Border */}
      <div className="absolute inset-0 rounded-3xl border border-white/10" />

      {/* Corner accent glows */}
      <div className="absolute top-0 -left-20 w-40 h-40 bg-[#18E614]/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#18E614]/10 rounded-full blur-3xl" />

      {/* Top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Map Container */}
      <motion.div
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="relative w-full flex flex-col h-full"
      >
        <h2 className="font-bold text-xs sm:text-sm px-2 sm:px-4 md:px-6 pt-2 sm:pt-4 z-10 truncate">
          Mental Health Network - {selectedCountry}
        </h2>

        <ComposableMap className="w-full h-56 sm:h-72 md:h-80 p-2 sm:p-4 flex-1">
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: CustomGeography[] }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  className={
                    theme === "dark"
                      ? "fill-gray-700 stroke-gray-600"
                      : "fill-blue-100 stroke-gray-300"
                  }
                />
              ))
            }
          </Geographies>
          {filteredData.map((point, idx) => (
            <Marker key={idx} coordinates={point.coordinates}>
              <motion.circle
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + idx * 0.02 }}
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

        {/* Country filter buttons */}
        <div className="flex flex-wrap gap-1 sm:gap-2 px-2 sm:px-4 md:px-6 py-2 sm:py-4 z-10 border-t border-white/10 mt-auto">
          {countries.map((country) => (
            <motion.button
              key={country}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCountry(country)}
              className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm transition-all ${
                selectedCountry === country
                  ? "bg-[#18E614] text-black"
                  : theme === "dark"
                  ? "bg-white/[0.05] border border-white/10 text-gray-300 hover:bg-white/[0.1]"
                  : "bg-black/[0.05] border border-black/10 text-gray-700 hover:bg-black/[0.1]"
              }`}
            >
              {country}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Sidebar Stats */}
      <ul className="hidden sm:grid relative w-fit sm:w-48 md:w-56 p-2 max-md:pt-10 space-y-2 text-xs sm:text-sm auto-rows-max border-l border-white/10">
        <motion.li
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col justify-between max-sm:min-w-[120px] relative group"
        >
          {/* Glassmorphic card */}
          <div
            className={`absolute inset-0 ${
              theme === "dark" ? "bg-white/[0.02]" : "bg-black/[0.02]"
            } backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity`}
          />
          <div className="absolute inset-0 border border-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative p-2">
            <span className="font-semibold max-md:font-normal uppercase text-sm max-md:text-xs">
              Wellness Centers
            </span>
            <span className="block text-[#127804] max-md:font-semibold text-md md:text-xl mt-1">
              {stats.wellness}
            </span>
            <span className="block rounded-md h-1 w-16 sm:w-20 bg-[#127804] mt-2" />
          </div>
        </motion.li>

        <motion.li
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.75 }}
          className="flex flex-col justify-between max-sm:min-w-[120px] relative group"
        >
          <div
            className={`absolute inset-0 ${
              theme === "dark" ? "bg-white/[0.02]" : "bg-black/[0.02]"
            } backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity`}
          />
          <div className="absolute inset-0 border border-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative p-2">
            <span className="font-semibold max-md:font-normal uppercase text-sm max-md:text-xs">
              Support Groups
            </span>
            <span className="block text-[#fbd205] max-md:font-semibold text-md md:text-xl mt-1">
              {stats.support}
            </span>
            <span className="block rounded-md h-1 w-20 max-sm:w-16 bg-[#fbd205] mt-1" />
          </div>
        </motion.li>

        <motion.li
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col justify-between max-sm:min-w-[120px] relative group"
        >
          <div
            className={`absolute inset-0 ${
              theme === "dark" ? "bg-white/[0.02]" : "bg-black/[0.02]"
            } backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity`}
          />
          <div className="absolute inset-0 border border-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative p-2">
            <span className="font-semibold max-md:font-normal uppercase text-sm max-md:text-xs">
              Crisis Centers
            </span>
            <span className="block text-[#ff0000] max-md:font-semibold text-md md:text-xl mt-1">
              {stats.crisis}
            </span>
            <span className="block rounded-md h-1 w-20 max-sm:w-16 bg-[#ff0000] mt-1" />
          </div>
        </motion.li>

        <motion.li
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.85 }}
          className="flex flex-col justify-between max-sm:min-w-[120px] relative group"
        >
          <div
            className={`absolute inset-0 ${
              theme === "dark" ? "bg-white/[0.02]" : "bg-black/[0.02]"
            } backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity`}
          />
          <div className="absolute inset-0 border border-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative p-2">
            <span className="font-semibold max-md:font-normal uppercase text-sm max-md:text-xs">
              Therapy Clinics
            </span>
            <span className="block text-[#021bff] max-md:font-semibold text-md md:text-xl mt-1">
              {stats.therapy}
            </span>
            <span className="block rounded-md h-1 w-20 max-sm:w-16 bg-[#021bff] mt-1" />
          </div>
        </motion.li>
      </ul>
    </motion.div>
  );
};

export default MapComponent;
