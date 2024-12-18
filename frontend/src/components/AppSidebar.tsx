"use client"

import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/Sidebar"
import { Link, useLocation } from "react-router-dom"
import mentalIcon from "@/assets/mental_Icon.svg"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const mainNavItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    href: "/home",
  },
  {
    title: "Appointments",
    icon: Calendar,
    href: "/appointments",
  },
  {
    title: "Doctors",
    icon: Users,
    href: "/doctors",
  },
  {
    title: "Pathology Results",
    icon: FileText,
    href: "/pathology-results",
  },
  {
    title: "Chats",
    icon: MessageSquare,
    href: "/chats",
    badge: "1",
  },
]

const accountNavItems = [
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    title: "Logout",
    icon: LogOut,
    href: "/logout",
    className: "text-red-500 hover:text-red-600",
  },
]

export function AppSidebar() {
  const { state, isMobile } = useSidebar()
  const { theme } = useTheme()
  const isCollapsed = state === "collapsed"
  const location = useLocation()

  const sidebarContent = (
    <Sidebar className="border-r bg-background">
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between px-4 py-2 relative z-[52]">
          <div className="flex items-center gap-2">
            <img 
              src={mentalIcon} 
              alt="Mental Verse" 
              className={cn(
                "h-full w-full transition-colors",
                theme === 'dark' ? 'invert' : 'invert-0'
              )}
            />
            {/* {(!isCollapsed || isMobile) && ( */}
              {/* // <span className="font-semibold">Mental Verse</span> */}
            {/* )} */}
          </div>
          <div className="relative z-[53]">
            <ThemeToggle />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-4">
        <SidebarMenu>
          {mainNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.href}
                tooltip={isCollapsed ? item.title : undefined}
              >
                <Link
                  to={item.href}
                  className="flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {!isCollapsed && <span>{item.title}</span>}
                  {item.badge && !isCollapsed && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="px-4 py-2">
          {!isCollapsed && <div className="text-xs font-semibold uppercase text-muted-foreground">Account</div>}
        </div>

        <SidebarMenu>
          {accountNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.href}
                tooltip={isCollapsed ? item.title : undefined}
              >
                <Link
                  to={item.href}
                  className={`flex items-center gap-2 ${item.className || ''}`}
                >
                  <item.icon className="h-4 w-4" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        {!isCollapsed && (
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-green-500">Emergency Helpline:</div>
            <div className="text-xs text-muted-foreground">+234 812 345 6789</div>
            <div className="text-xs text-muted-foreground">+234 812 345 6789</div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )

  return sidebarContent
}
