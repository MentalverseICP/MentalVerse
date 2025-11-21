import React, { useState, useEffect } from "react";
import { Bot, Search, SearchIcon, SearchX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import notification from "@/images/Notification Icon.svg";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";
import { Separator } from "@radix-ui/react-separator";
import userImg from "@/images/OIP (18).jpeg";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/contexts/SearchContext";

import mentalIcon from "@/images/mental_Icon.svg";
import mentalIconDark from "@/images/mental_Icon_dark.svg";
import mentalIconMobileLight from "@/images/mental_Icon_mobile_light.svg";
import mentalIconMobileDark from "@/images/mental_Icon_mobile_dark1.svg";

import { ThemeToggle } from "./theme-toggle";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface SearchBarProps {
  onSearchChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearchChange,
  className = "",
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isLargeScreen = useMediaQuery("(min-width: 1023px)");
  const isSmallScreen = useMediaQuery("(min-width: 480px)");
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const { performSearch, searchResults, isSearching } = useSearch();

  useEffect(() => {
    const userProfile = localStorage.getItem("userProfile");
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      setUserPhoto(profile.photo || null);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const userProfile = localStorage.getItem("userProfile");
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        setUserPhoto(profile.photo || null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("profileUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("profileUpdated", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput.trim()) {
        performSearch(searchInput);
        onSearchChange(searchInput);
      } else {
        performSearch("");
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, performSearch, onSearchChange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-b-3xl max-lg:rounded-b-none h-24 mx-2 p-5 max-sm:p-3 grid xl:gap-8 lg:gap-6 md:gap-4 sm:gap-3 gap-2 grid-flow-col items-center justify-between z-20 overflow-hidden ${className}`}
    >
      {/* Glassmorphic background */}
      <div
        className={`absolute inset-0 ${
          theme === "dark" ? "bg-[#0B0B0C]/90" : "bg-[#F7F7F7]/90"
        } backdrop-blur-xl`}
      />

      {/* Border */}
      <div
        className={`absolute inset-0 border-2 ${
          theme === "dark" ? "border-white/10" : "border-black/15"
        } dark:border-[#2f3339] rounded-b-3xl max-lg:rounded-b-none`}
      />

      {/* Accent glows */}
      <div
        className={`absolute -top-10 left-1/4 w-40 h-40 ${
          theme === "dark" ? "bg-[#18E614]/10" : "bg-[#18E614]/30"
        } rounded-full blur-3xl`}
      />
      <div
        className={`absolute -bottom-10 right-1/4 w-40 h-40 ${
          theme === "dark" ? "bg-[#18E614]/10" : "bg-[#18E614]/30"
        } rounded-full blur-3xl`}
      />

      <div className="relative flex items-center justify-start px-1 z-[52] flex-shrink-0">
        <img
          src={
            isLargeScreen
              ? theme === "dark"
                ? mentalIconDark
                : mentalIcon
              : theme === "dark"
              ? mentalIconMobileDark
              : mentalIconMobileLight
          }
          alt="Mental Verse"
          className={cn("logo transition max-h-12 w-auto")}
        />
      </div>

      <div className="relative flex xl:gap-4 lg:gap-3 sm:gap-2 gap-1 items-center justify-end flex-shrink-0">
        {/* Search */}
        <div className="flex items-center relative z-50">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex-1 flex items-center rounded-xl p-1 overflow-hidden min-w-0 mx-2 h-10 ${
                  theme === "dark"
                    ? "bg-white/[0.05] border border-white/10"
                    : "bg-black/[0.05] border border-black/10"
                } backdrop-blur-md shadow-sm`}
              >
                <Search className="h-4 w-4 flex-none text-gray-500 dark:text-gray-400 ml-3" />
                <input
                  type="text"
                  placeholder={
                    isSmallScreen
                      ? "Search doctors, appointments, features..."
                      : "Search"
                  }
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-gray-700 dark:text-gray-300 py-2 px-3 text-sm min-w-0 placeholder:text-xs"
                  aria-label="Search"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Results Dropdown */}
          {isOpen && searchInput && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute top-full left-2 right-2 mt-2 rounded-xl overflow-hidden shadow-xl z-[9999] max-h-64 overflow-y-auto ${
                theme === "dark"
                  ? "bg-gray-800/95 border border-gray-700"
                  : "bg-white/95 border border-gray-200"
              } backdrop-blur-xl`}
            >
              {searchResults.length > 0 ? (
                <div className="p-2">
                  {searchResults.slice(0, 5).map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-2 rounded-lg cursor-pointer ${
                        theme === "dark"
                          ? "hover:bg-gray-700/50"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        setSearchInput("");
                        setIsOpen(false);
                        if (result.route) {
                          navigate(result.route);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#18E614] rounded-full"></div>
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {result.name || result.title}
                          </p>
                          <p
                            className={`text-xs ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {result.specialization ||
                              result.condition ||
                              result.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : !isSearching && searchInput ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No results found for "{searchInput}"
                </div>
              ) : null}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-9 h-9 bg-[#18E614]/40 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center overflow-hidden"
            aria-label={isOpen ? "Close search" : "Open search"}
          >
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />

            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SearchX size={18} />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SearchIcon size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Theme Toggle */}
        <div className="relative max-sm:hidden">
          <ThemeToggle />
        </div>

        {/* Notification */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          title="Notifications"
          className={cn(
            "relative lg:w-10 w-7 lg:h-10 h-7 flex items-center justify-center rounded-lg transition-all duration-300 overflow-hidden flex-shrink-0",
            theme === "dark"
              ? "bg-white/[0.02] border border-white/10 hover:border-[#18E614] hover:shadow-[0_2px_10px_rgba(24,230,20,0.3)]"
              : "bg-black/[0.02] border border-black/10 hover:border-black hover:shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
          )}
        >
          <div className="relative z-10">
            <img src={notification} alt="notification" className="w-5 h-5" />
          </div>
        </motion.button>

        <Separator
          orientation="vertical"
          className="w-px h-5 bg-gray-300 dark:bg-gray-700 max-xs:hidden"
        />

        {/* User Profile */}
        <div className="relative flex-shrink-0">
          {true ? (
            <div className="flex items-center gap-2 sm:mt-1">
              <div className="lg:w-12 lg:h-12 w-7 h-7 max-sm:w-10 max-sm:h-10 border-2 border-[#18E614] rounded-full flex-shrink-0 overflow-hidden">
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt=""
                    className="rounded-full object-cover w-full h-full"
                  />
                ) : (
                  <img
                    src={userImg}
                    alt=""
                    className="rounded-full object-cover w-full h-full"
                  />
                )}
              </div>
              <div className="flex flex-col justify-items-center max-sm:hidden min-w-0">
                <span className="md:text-sm text-xs whitespace-nowrap overflow-hidden text-ellipsis font-semibold">
                  {(() => {
                    const userProfile = localStorage.getItem("userProfile");
                    if (userProfile) {
                      const profile = JSON.parse(userProfile);
                      return `${profile.firstName} ${profile.lastName}`;
                    }
                    return "User";
                  })()}
                </span>
                <span className="text-[10px] tracking-wider text-[#18E614] font-bold whitespace-nowrap">
                  {(() => {
                    const userRole = localStorage.getItem("userRole");
                    return userRole ? userRole.toUpperCase() : "USER";
                  })()}
                </span>
              </div>
            </div>
          ) : (
            <button title="Profile" className="cursor-default" type="button">
              <Bot className="text-[#18E614]" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchBar;
