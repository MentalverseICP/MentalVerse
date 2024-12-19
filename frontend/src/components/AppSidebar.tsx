"use client"

import {
  Combine,
  CalendarRange,
  Users,
  SquareActivity,
  MessagesSquare,
  Cog,
  LogOut,
  Vibrate,
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
    icon: Combine,
    href: "/home",
  },
  {
    title: "Appointments",
    icon: CalendarRange,
    href: "/appointments",
  },
  {
    title: "Doctors",
    icon: Users,
    href: "/doctors",
  },
  {
    title: "Pathology Results",
    icon: SquareActivity,
    href: "/pathology-results",
  },
  {
    title: "Chats",
    icon: MessagesSquare,
    href: "/chats",
    badge: "1",
  },
]

const accountNavItems = [
  {
    title: "Settings",
    icon: Cog,
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
    <Sidebar className={cn("md:relative border rounded-3xl m-3 w-44 min-h-[95vh] z-50 tracking-wider flex flex-col", theme === 'dark' ? 'bg-background' : 'bg-zinc-50')}>
      <SidebarHeader className="border-b">
        <div className={cn("flex items-center justify-between", isCollapsed ? 'gap-0' : 'md:gap-7 gap-1')}>
          <Link to={"/"} className="flex items-center justify-between px-1 relative z-[52]">
            <img
              src={getIcon()}
              alt="Mental Verse"
              className={cn("transition-all logo", isCollapsed ? 'h-16 w-7' : 'md:h-20 md:w-48 h-16 w-32')}
            />
          </Link>
          <Separator orientation="vertical" className="w-px h-5 bg-gray-500" />
          <SidebarTrigger className={cn("-ml-1 w-7 h-7 flex items-center justify-center hover:-translate-y-1  rounded-lg transition-all duration-300 hover:border-t hover:border-b", theme === 'dark' ? 'bg-background hover:bg-black hover:shadow-[0_2px_0_0_rgba(204,255,0,0.811)] hover:border-lime-400' : 'bg-white hover:border-black hover:shadow-[0_2px_0_0_rgba(0,0,0,0.811)]')} />
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-2 md:gap-4">
        <SidebarMenu className="flex gap-2 md:gap-5">
          {mainNavItems.map((item) => (
            <SidebarMenuItem key={item.href} className={cn("h-full w-full", theme === 'dark' ? 'hover:bg-white' : 'hover:bg-[#DFE0E2]', location.pathname === item.href && (theme === 'dark' ? 'bg-white' : 'bg-[#DFE0E2]'))}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.href}
                tooltip={isCollapsed ? item.title : undefined}
              >
                <Link
                  to={item.href}
                  className={`flex items-center md:gap-6 ${location.pathname === item.href ? 'text-green-500 font-medium' : (theme === 'dark' ? 'text-white' : 'text-black')}`}
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
            <SidebarMenuItem key={item.href} className={cn("h-full w-full", theme === 'dark' ? 'hover:bg-white' : 'hover:bg-[#DFE0E2]', location.pathname === item.href && (theme === 'dark' ? 'bg-white' : 'bg-[#DFE0E2]'))}>
            {/* // <SidebarMenuItem key={item.href} className={cn(`h-full w-full ${theme === 'dark' ? 'hover:bg-white' : 'hover:bg-[#DFE0E2]'} ${location.pathname === item.href && (theme === 'dark' ? 'bg-white' : 'bg-[#DFE0E2]')}`)}> */}
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.href}
                tooltip={isCollapsed ? item.title : undefined}
              >
                <Link
                  to={item.href}
                  className={cn(`flex items-center md:gap-6 ${location.pathname === item.href ? 'text-green-500 font-medium' : (theme === 'dark' ? 'text-white' : 'text-black')}`, item.className)}
                >
                  <item.icon className="h-4 w-4" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 pl-6 tracking-wide flex flex-row gap-5 h-fit">
        <Vibrate className="self-center" />
        {!isCollapsed && (
          <div className="flex flex-col gap-2 justify-items-end">
            <div className="text-sm font-semibold text-red-500">Emergency Hotlines:</div>
            <div className="flex flex-col justify-between ml-2">
              <div className="text-xs text-muted-foreground">+234 812 345 6789</div>
              <div className="text-xs text-muted-foreground">+234 812 345 6789</div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )

  return sidebarContent
}
