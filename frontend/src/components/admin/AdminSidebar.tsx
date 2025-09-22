"use client";

import React from "react";
import {
  BarChart3,
  Users,
  Coins,
  Settings,
  LogOut,
  Shield,
  Database,
  Activity,
  Zap,
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

type NavItem = {
  title: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  className?: string;
};

export function AdminSidebar({ className }: { className?: string }) {
  const { state } = useSidebar();
  const { theme } = useTheme();
  const isCollapsed = state === "collapsed";
  const location = useLocation();

  const mainNavItems: NavItem[] = [
    { title: "Dashboard", icon: BarChart3, href: "/admin/dashboard" },
    { title: "User Management", icon: Users, href: "/admin/users" },
    { title: "Token Management", icon: Coins, href: "/admin/tokens" },
    { title: "System Health", icon: Activity, href: "/admin/health" },
    { title: "Smart Contracts", icon: Database, href: "/admin/contracts" },
    { title: "Security", icon: Shield, href: "/admin/security" },
    { title: "System Logs", icon: Zap, href: "/admin/logs" },
  ];

  const accountNavItems: NavItem[] = [
    { title: "Settings", icon: Settings, href: "/settings" },
    { title: "Logout", icon: LogOut, href: "/logout", className: "text-[#F80D38] hover:text-red-600" },
  ];

  const containerClasses = cn(
    "pt-5 fixed lg:relative transition-[width] overflow-hidden rounded-3xl max-lg:rounded-none m-3 max-md:mx-1 max-lg:mx-2 max-sm:mx-0 w-44 max-lg:h-[calc(100vh-6rem)] max-xs:pb-5 dark:border-[#2f3339] border-2 tracking-wider flex flex-col scrollbar-custom",
    className,
    theme === "dark" ? "bg-[#0B0B0C]" : "bg-[#F7F7F7]"
  );

  return (
    <Sidebar className={containerClasses}>
      <SidebarContent className="flex flex-col items-center gap-2 md:gap-2 mt-1 scrollbar-custom h-full">
        {/* Collapse / expand trigger */}
        <SidebarTrigger
          className={cn(
            "relative h-8 w-8 md:h-10 md:w-10 flex items-center justify-center hover:scale-90 rounded-lg transition-[width] duration-75",
            theme === "dark" ? "bg-[#000] hover:bg-[#1f1f1f]" : "bg-white hover:border-black hover:shadow-[0_2px_0_0_rgba(0,0,0,0.811)]"
          )}
        />

        {/* Main navigation */}
        <SidebarMenu className="flex gap-2 md:gap-3 w-full">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <SidebarMenuItem
                key={item.href}
                className={cn(
                  "h-full w-full",
                  theme === "dark" ? "hover:bg-[#1f1f1f]" : "hover:bg-[#DFE0E2]",
                  isActive && (theme === "dark" ? "bg-[#1f1f1f]" : "bg-[#DFE0E2]")
                )}
              >
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={isCollapsed ? item.title : undefined}
                  className="hover:text-[#18E614] brightness-90"
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center md:gap-6 px-3 py-2",
                      isActive ? "text-[#18E614] font-medium" : theme === "dark" ? "text-white" : "text-black"
                    )}
                  >
                    {/* Render icon */}
                    <Icon className="w-4 h-4" />

                    {/* Title (hidden when collapsed) */}
                    {!isCollapsed && <span>{item.title}</span>}

                    {/* Badge */}
                    {item.badge && !isCollapsed && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#F80D38] text-xs text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {/* Account header */}
        <div className="px-4 py-2 w-full">
          {!isCollapsed && <div className="text-xs font-semibold uppercase text-muted-foreground">Account</div>}
        </div>

        {/* Account menu */}
        <SidebarMenu className="w-full">
          {accountNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <SidebarMenuItem
                key={item.href}
                className={cn(
                  "h-full w-full",
                  theme === "dark" ? "hover:bg-[#1f1f1f]" : "hover:bg-[#DFE0E2]",
                  isActive && (theme === "dark" ? "bg-[#1f1f1f]" : "bg-[#DFE0E2]")
                )}
              >
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={isCollapsed ? item.title : undefined}
                  className="hover:text-[#18E614] brightness-90"
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center md:gap-6 px-3 py-2",
                      isActive ? "text-[#18E614] font-medium" : theme === "dark" ? "text-white" : "text-black",
                      item.className
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer with admin info */}
      <SidebarFooter className="border-t dark:border-[#2f3339] p-4 pl-5 tracking-wide flex flex-row gap-5 h-fit">
        <Shield className="self-center text-[#18E614]" />
        {!isCollapsed && (
          <div className="flex flex-col gap-2 justify-items-end">
            <div className="text-sm font-semibold text-[#F80D38]">Admin Panel</div>
            <div className="flex flex-col justify-between ml-2">
              <div className="text-xs text-muted-foreground">System Administrator</div>
              <div className="text-xs text-muted-foreground">Full Access</div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}