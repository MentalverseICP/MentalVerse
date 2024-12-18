import { LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/Sidebar"

interface NavProjectsProps {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}

export function NavProjects({ projects }: NavProjectsProps) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarGroup>
      {!isCollapsed && <SidebarGroupLabel>Projects</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {projects.map((project) => (
            <SidebarMenuItem key={project.name}>
              <SidebarMenuButton 
                asChild 
                tooltip={isCollapsed ? project.name : undefined}
              >
                <a href={project.url} className="flex items-center gap-2">
                  <project.icon className="h-4 w-4" />
                  {!isCollapsed && <span>{project.name}</span>}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
} 