import { LucideIcon } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/Sidebar"

interface TeamSwitcherProps {
  teams: {
    name: string
    logo: LucideIcon
    plan: string
  }[]
}

export function TeamSwitcher({ teams }: TeamSwitcherProps) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarMenu>
      {teams.map((team) => (
        <SidebarMenuItem key={team.name}>
          <SidebarMenuButton tooltip={isCollapsed ? team.name : undefined}>
            <team.logo className="h-4 w-4" />
            {!isCollapsed && (
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium">{team.name}</span>
                <span className="text-xs text-muted-foreground">
                  {team.plan}
                </span>
              </div>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
} 