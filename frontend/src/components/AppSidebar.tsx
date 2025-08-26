"use client"

import {
  Vibrate,
  Gift,
  Wallet,
  Send,
  TrendingUp,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/Sidebar"
import { Link, useLocation } from "react-router-dom"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

import overview from '@/images/Overview Icon.svg'
import appointments from '@/images/Appointments Icon.svg'
import doctors from '@/images/Doctors Icon.svg'
import medicalIcon from '@/images/medical.svg'
import chats from '@/images/Chats Icon.svg'
import setttings from '@/images/Settings Icon.svg'
import logout from '@/images/Logout Icon.svg'



export function AppSidebar({ className }: { className?: string }) {
  const { state, } = useSidebar()
  const { theme } = useTheme()
  const isCollapsed = state === "collapsed"
  const location = useLocation();


  const mainNavItems = [
    {
      title: "Overview",
      icon: () => (<img src={overview} alt="Overview Icon" className={`${isCollapsed ? "h-7 w-7" : "h-4 w-4"}`} />),
      href: "/home",
    },
    {
      title: "Appointments",
      icon: () => (<img src={appointments} alt="Appointments Icon" className={`${isCollapsed ? "h-7 w-7" : "h-4 w-4"}`} />),
      href: "/appointments",
    },
    {
      title: "Doctors",
      icon: () => (<img src={doctors} alt="Doctors Icon" className={`${isCollapsed ? "h-7 w-7" : "h-4 w-4"}`} />),
      href: "/doctors",
    },
    {
      title: "Medical",
      icon: () => (<img src={medicalIcon} alt="Medical Icon" className={`${isCollapsed ? "h-7 w-7" : "h-4 w-4"}`} />),
      href: "/medical",
    },
    {
      title: "Chats",
      icon: () => (<img src={chats} alt="Chats Icon" className={`${isCollapsed ? "h-7 w-7" : "h-4 w-4"}`} />),
      href: "/chats",
      badge: "1",
    },
    {
      title: "Claims",
      icon: Gift,
      href: "/claims",
    },
    {
      title: "Token Wallet",
      icon: Wallet,
      href: "/token-wallet",
    },
    {
      title: "Token Transfer",
      icon: Send,
      href: "/token-transfer",
    },
    {
      title: "Token Staking",
      icon: TrendingUp,
      href: "/token-staking",
    },
  ]
  
  const accountNavItems = [
    {
      title: "Settings",
      icon: () => (<img src={setttings} alt="Settings Icon" className={`${isCollapsed ? "h-7 w-7" : "h-4 w-4"}`} />),
      href: "/settings",
    },
    {
      title: "Logout",
      icon: () => (<img src={logout} alt="Logout Icon" className={`${isCollapsed ? "h-7 w-7" : "h-4 w-4"}`} />),
      href: "/logout",
      className: "text-[#F80D38] hover:text-red-600",
    },
  ]
 

  // const getIcon = () => {
  //   if (isMobile) {
  //     return theme === 'dark' ? mentalIconMobileDark : mentalIconMobileLight
  //   }
  //   return isCollapsed ? (theme === 'dark' ? mentalIconMobileDark : mentalIconMobileLight) : (theme === 'dark' ? mentalIconDark : mentalIcon)
  // }

  const sidebarContent = (
    <Sidebar className={cn(`pt-5 fixed lg:relative transition-[width] overflow-hidden rounded-3xl max-lg:rounded-none m-3 max-md:mx-1 max-lg:mx-2 max-sm:mx-0 w-44 max-lg:h-[calc(100vh-6rem)] max-xs:pb-5 dark:border-[#2f3339] border-2 tracking-wider flex flex-col scrollbar-custom ${className}`, theme === 'dark' ? 'bg-[#0B0B0C]' : 'bg-[#F7F7F7]')}>

      <SidebarContent className="flex flex-col items-center gap-2 md:gap-2 mt-1 scrollbar-custom h-full">
        <SidebarTrigger className={cn("relative h-8 w-8 md:h-10 md:w-10 flex items-center justify-center hover:scale-90 rounded-lg transition-[width] duration-75", theme === 'dark' ? 'bg-[#000] hover:bg-[#1f1f1f]' : 'bg-white hover:border-black hover:shadow-[0_2px_0_0_rgba(0,0,0,0.811)]')} />
        <SidebarMenu className="flex gap-2 md:gap-3">
          {mainNavItems.map((item: { title: string; icon: React.FC; href: string; badge?: string }) => (
            <SidebarMenuItem key={item.href} className={cn("h-full w-full", theme === 'dark' ? 'hover:bg-[#1f1f1f]' : 'hover:bg-[#DFE0E2]', location.pathname === item.href && (theme === 'dark' ? 'bg-[#1f1f1f]' : 'bg-[#DFE0E2]'))}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.href}
                tooltip={isCollapsed ? item.title : undefined}
                className="hover:text-[#18E614] brightness-90"
              >
                <Link
                  to={item.href}
                  className={`flex items-center md:gap-6 ${location.pathname === item.href ? 'text-[#18E614] font-medium' : (theme === 'dark' ? 'text-white' : 'text-black')}`}
                >
                  <item.icon />
                  {!isCollapsed && <span>{item.title}</span>}
                  {item.badge && ( 
                    <span className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#F80D38] text-xs text-white ${isCollapsed ? 'hidden' : 'flex'}`}>
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
            <SidebarMenuItem key={item.href} className={cn("h-full w-full", theme === 'dark' ? 'hover:bg-[#1f1f1f]' : 'hover:bg-[#DFE0E2]', location.pathname === item.href && (theme === 'dark' ? 'bg-[#1f1f1f]' : 'bg-[#DFE0E2]'))}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.href}
                tooltip={isCollapsed ? item.title : undefined}
                className="hover:text-[#18E614] brightness-90"
              >
                <Link
                  to={item.href}
                  className={cn(`flex items-center md:gap-6 ${location.pathname === item.href ? 'text-[#18E614] font-medium' : (theme === 'dark' ? 'text-white' : 'text-black')}`, item.className)}
                >
                  <item.icon />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t dark:border-[#2f3339] p-4 pl-5 tracking-wide flex flex-row gap-5 h-fit">
        <Vibrate className="self-center text-[#18E614]" />
        {!isCollapsed && (
          <div className="flex flex-col gap-2 justify-items-end">
            <div className="text-sm font-semibold text-[#F80D38]">Emergency Hotlines:</div>
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
