"use client";

import { useState } from "react";
import {
  Smartphone,
  Gift,
  Wallet,
  Send,
  TrendingUp,
  Droplets,
  ChevronDown,
  Grid3X3
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/Sidebar";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../shared/theme-provider";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import overview from "@/images/Overview Icon.svg";
import appointments from "@/images/Appointments Icon.svg";
import doctors from "@/images/Doctors Icon.svg";
import medicalIcon from "@/images/medical.svg";
import chats from "@/images/Chats Icon.svg";
import setttings from "@/images/Settings Icon.svg";
import logout from "@/images/Logout Icon.svg";

export function AppSidebar({ className }: { className?: string }) {
  const { state } = useSidebar();
  const { theme } = useTheme();
  const isCollapsed = state === "collapsed";
  const location = useLocation();
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false);

  const mainNavItems = [
    {
      title: "Overview",
      icon: () => (
        <img
          src={overview}
          alt="Overview Icon"
          className={`${isCollapsed ? "h-7 w-7" : "h-4 w-4"}`}
        />
      ),
      href: "/patients/home",
    },
    {
      title: "Appointments",
      icon: () => (
        <img
          src={appointments}
          alt="Appointments Icon"
          className={`${isCollapsed ? "h-7 w-7" : "h-4 w-4"}`}
        />
      ),
      href: "/appointments",
    },
    {
      title: "Doctors",
      icon: () => (
        <img
          src={doctors}
          alt="Doctors Icon"
          className={`${isCollapsed ? "h-7 w-7" : "h-4 w-4"}`}
        />
      ),
      href: "/patients/doctors",
    },
    {
      title: "Medical",
      icon: () => (
        <img
          src={medicalIcon}
          alt="Medical Icon"
          className={`${isCollapsed ? "h-7 w-7" : "h-4 w-4"}`}
        />
      ),
      href: "/patients/medical",
    },
    {
      title: "Chats",
      icon: () => (
        <img
          src={chats}
          alt="Chats Icon"
          className={`${isCollapsed ? "h-7 w-7" : "h-4 w-4"}`}
        />
      ),
      href: "/chats",
      badge: "1",
    },
  ];

  const tokenItems = [
    { title: "Claims", href: "/patients/claims", icon: Gift },
    { title: "Token Wallet", href: "/patients/token-wallet", icon: Wallet },
    { title: "Token Transfer", href: "/patients/token-transfer", icon: Send },
    {
      title: "Token Staking",
      href: "/patients/token-staking",
      icon: TrendingUp,
    },
    {
      title: "Testnet Faucet",
      href: "/patients/testnet-faucet",
      icon: Droplets,
    },
  ];

  const accountNavItems = [
    {
      title: "Settings",
      icon: () => (
        <img
          src={setttings}
          alt="Settings Icon"
          className={`${isCollapsed ? "h-7 w-7" : "h-4 w-4"}`}
        />
      ),
      href: "/settings",
    },
    {
      title: "Logout",
      icon: () => (
        <img
          src={logout}
          alt="Logout Icon"
          className={`${isCollapsed ? "h-7 w-7" : "h-4 w-4"}`}
        />
      ),
      href: "/logout",
      className: "text-[#F80D38] hover:text-red-600",
    },
  ];

  // const getIcon = () => {
  //   if (isMobile) {
  //     return theme === 'dark' ? mentalIconMobileDark : mentalIconMobileLight
  //   }
  //   return isCollapsed ? (theme === 'dark' ? mentalIconMobileDark : mentalIconMobileLight) : (theme === 'dark' ? mentalIconDark : mentalIcon)
  // }

  const sidebarContent = (
    <Sidebar
      className={cn(
        `pt-5 fixed lg:relative transition-[width] overflow-y-auto rounded-3xl max-lg:rounded-none m-3 max-md:mx-1 max-lg:mx-2 max-sm:mx-0 w-44 max-lg:h-[calc(100vh-6rem)] max-xs:pb-5 border tracking-wider flex flex-col scrollbar-custom ${className}`,
        theme === "dark"
          ? "bg-[#0B0B0C]/60 border-white/10 backdrop-blur-xl"
          : "bg-white/60 border-black/10 backdrop-blur-xl"
      )}
    >
      <SidebarContent className="flex flex-col gap-2 md:gap-3 mt-1 scrollbar-custom h-full">
        <SidebarTrigger
          className={cn(
            "relative h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-lg transition-all hover:scale-105",
            theme === "dark"
              ? "bg-white/10 hover:bg-white/20 border border-white/10"
              : "bg-black/10 hover:bg-black/20 border border-black/10",
            isCollapsed
              ? "ml-3.5" 
              : "ml-[6.5rem]" 
          )}
        />

        {/* Main Navigation Items */}
        <SidebarMenu className="flex flex-col gap-2">
          {mainNavItems.map((item) => (
            <SidebarMenuItem
              key={item.href}
              className={cn(
                "rounded-lg transition-all",
                location.pathname === item.href
                  ? theme === "dark"
                    ? "bg-gradient-to-r from-[#18E614]/30 to-[#12B80E]/20 border border-[#18E614]/40"
                    : "bg-gradient-to-r from-[#18E614]/20 to-[#7FF54A]/10 border border-[#18E614]/30"
                  : theme === "dark"
                  ? "hover:bg-white/10"
                  : "hover:bg-black/10"
              )}
            >
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.href}
                tooltip={isCollapsed ? item.title : undefined}
                className={cn(
                  "hover:text-[#18E614] transition-colors text-xs md:text-sm",
                  location.pathname === item.href &&
                    "text-[#18E614] font-semibold"
                )}
              >
                <Link
                  to={item.href}
                  className={`flex items-center justify-start md:gap-3 gap-2 transition-all w-full ${
                    location.pathname === item.href
                      ? "text-[#18E614] font-semibold"
                      : theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  <item.icon />
                  {!isCollapsed && <span>{item.title}</span>}
                  {item.badge && (
                    <span
                      className={`ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-xs font-bold text-white ${
                        isCollapsed ? "hidden" : "flex"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          {/* Token Services Dropdown */}
          <motion.div className="rounded-lg overflow-hidden" initial={false}>
            <motion.button
              onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)}
              className={cn(
                "w-full flex items-center md:gap-4 gap-2 px-3 md:px-4 py-2 rounded-lg transition-all text-xs md:text-sm font-medium",
                isTokenDropdownOpen
                  ? theme === "dark"
                    ? "bg-[#18E614]/20 border border-[#18E614]/40 text-[#18E614]"
                    : "bg-[#18E614]/15 border border-[#18E614]/30 text-[#18E614]"
                  : theme === "dark"
                  ? "bg-white/[0.05] border border-white/10 text-gray-300 hover:bg-white/[0.1]"
                  : "bg-black/[0.05] border border-black/10 text-gray-700 hover:bg-black/[0.1]"
              )}
            >
              <ChevronDown className="w-4 h-4 md:w-5 md:h-5 " />
              {!isCollapsed && (
                <>
                  <span>Services</span>
                  <motion.div
                    animate={{ rotate: isTokenDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-auto"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </motion.div>
                </>
              )}
            </motion.button>

            {/* Dropdown Items */}
            <AnimatePresence>
              {isTokenDropdownOpen && !isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-1 mt-2 pl-2 border-l border-white/10">
                    {tokenItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all",
                          location.pathname === item.href
                            ? theme === "dark"
                              ? "bg-[#18E614]/20 border border-[#18E614]/30 text-[#18E614]"
                              : "bg-[#18E614]/15 border border-[#18E614]/30 text-[#18E614]"
                            : theme === "dark"
                            ? "text-gray-400 hover:text-[#18E614] hover:bg-white/[0.05]"
                            : "text-gray-600 hover:text-[#18E614] hover:bg-black/[0.05]"
                        )}
                      >
                        <item.icon className="w-3.5 h-3.5" />
                        <span>{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </SidebarMenu>

        <div className="px-4 py-3 w-full">
          {!isCollapsed && (
            <div
              className={`text-xs font-bold uppercase tracking-wider ${
                theme === "dark" ? "text-gray-500" : "text-gray-600"
              }`}
            >
              Account
            </div>
          )}
        </div>

        <SidebarMenu className="w-full">
          {accountNavItems.map((item) => (
            <SidebarMenuItem
              key={item.href}
              className={cn(
                "h-full w-full rounded-lg transition-all",
                location.pathname === item.href
                  ? theme === "dark"
                    ? "bg-red-500/20 border border-red-500/30"
                    : "bg-red-100 border border-red-200"
                  : theme === "dark"
                  ? "hover:bg-white/10"
                  : "hover:bg-black/10"
              )}
            >
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.href}
                tooltip={isCollapsed ? item.title : undefined}
                className={cn(
                  "transition-colors",
                  item.href === "/logout"
                    ? location.pathname === item.href
                      ? "text-red-500"
                      : "text-red-400 hover:text-red-500"
                    : "hover:text-[#18E614]"
                )}
              >
                <Link
                  to={item.href}
                  className={cn(
                    `flex items-center md:gap-4 transition-all`,
                    item.href === "/logout"
                      ? location.pathname === item.href
                        ? "text-red-500 font-semibold"
                        : "text-red-400"
                      : location.pathname === item.href
                      ? "text-[#18E614] font-semibold"
                      : theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  )}
                >
                  <item.icon />
                  {!isCollapsed && (
                    <span className="text-sm">{item.title}</span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter
        className={cn(
          "border-t p-4 pl-5 tracking-wide flex flex-row gap-4 h-fit",
          theme === "dark"
            ? "border-white/10 bg-white/5"
            : "border-black/10 bg-black/5"
        )}
      >
        <div
          className={cn(
            "self-center p-2 rounded-lg",
            theme === "dark" ? "bg-[#18E614]/10" : "bg-[#18E614]/5"
          )}
        >
          <Smartphone className="text-[#18E614]" size={20} />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col gap-2">
            <div
              className={`text-xs font-bold uppercase tracking-wider ${
                theme === "dark" ? "text-[#18E614]" : "text-[#18E614]"
              }`}
            >
              Emergency
            </div>
            <div className="flex flex-col gap-1">
              <a
                href="tel:+234-812-345-6789"
                className={`text-xs font-semibold hover:underline transition-all ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-emerald-400"
                    : "text-gray-600 hover:text-emerald-600"
                }`}
              >
                +234 812 345 6789
              </a>
              <a
                href="tel:+234-812-345-6789"
                className={`text-xs font-semibold hover:underline transition-all ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-emerald-400"
                    : "text-gray-600 hover:text-emerald-600"
                }`}
              >
                +234 812 345 6789
              </a>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );

  return sidebarContent;
}
