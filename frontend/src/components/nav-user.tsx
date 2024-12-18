import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/Sidebar"

interface NavUserProps {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function NavUser({ user }: NavUserProps) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={isCollapsed ? user.name : undefined}>
          <button className="flex items-center gap-2">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-6 w-6 rounded-full"
            />
            {!isCollapsed && (
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            )}
          </button>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
} 