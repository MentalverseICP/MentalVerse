import { ChartDonut } from "@/components/Chart-pie-donut-text"
import { ChartInteractive } from "@/components/Chart-pie-interactive"
import { ChartRadar } from "@/components/Chart-radar-dots"
import { useSidebar } from '@/components/ui/Sidebar';
import StackedBarLineChart from "@/components/ui/StackedBarLineChart";



// import { ThemeToggle } from "@/components/ThemeToggle"
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb"
// import { Separator } from "@/components/ui/Separator"
// import { SidebarTrigger } from "@/components/ui/Sidebar"

export default function Home() {

  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <div className={`flex max-md:ml-44 mt-44 ml-2 flex-wrap ${isCollapsed ? 'xl:gap-20 lg:gap-10 max-md:gap-5 max-sm:gap-0' : 'xl:gap-5'}`}>
      <ChartDonut />
      <ChartInteractive />
      <StackedBarLineChart />
      <ChartRadar />
      {/* <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="relative">
          <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div> */}
    </div>
  )
}
