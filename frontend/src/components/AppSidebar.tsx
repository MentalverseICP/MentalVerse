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
  SidebarTrigger,
} from "@/components/ui/Sidebar"
import { Link, useLocation } from "react-router-dom"
import mentalIcon from "@/assets/mental_Icon.svg"
import mentalIconDark from "@/assets/mental_Icon_dark.svg"
import mentalIconMobileLight from "@/assets/mental_Icon_mobile_light.svg"
import mentalIconMobileDark from "@/assets/mental_Icon_mobile_dark.svg"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Separator } from "@radix-ui/react-separator"

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

  const getIcon = () => {
    if (isMobile) {
      return theme === 'dark' ? mentalIconMobileDark : mentalIconMobileLight
    }
    return isCollapsed ? (theme === 'dark' ? mentalIconMobileDark : mentalIconMobileLight) : (theme === 'dark' ? mentalIconDark : mentalIcon)
  }

  const sidebarContent = (
    <Sidebar className="border rounded-3xl m-3 w-44 min-h-[95vh]">
      <SidebarHeader className="border-b">
        <div className={cn("flex items-center justify-between", isCollapsed ? 'gap-0' : 'gap-7')}>
          <Link to={"/"} className="flex items-center justify-between px-1 relative z-[52]">
            <img
              src={getIcon()}
              alt="Mental Verse"
              className={cn("transition-all", isCollapsed ? 'h-fit w-fit' : 'h-20 w-48')}
            />
          </Link>
          <Separator orientation="vertical" className="mr-2 h-4" />
          <SidebarTrigger className="-ml-1" />
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-4">
        <SidebarMenu className="flex gap-5">
          {mainNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.href}
                tooltip={isCollapsed ? item.title : undefined}
              >
                <Link
                  to={item.href}
                  className="flex items-center md:gap-6"
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
                  className={`flex items-center md:gap-6 ${item.className || ''}`}
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
