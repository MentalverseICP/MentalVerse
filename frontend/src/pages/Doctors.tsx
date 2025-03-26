import { useSidebar } from '@/components/ui/Sidebar';

const Doctors = () => {

  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  return (
    <div className={`p-5 relative h-full mt-36 max-sm:ml-[3rem] max-md:ml-16 max-md:mr-10 -ml-2  max-sm:mr-10 transition-all dark:bg-transparent grid ${isCollapsed ? 'w-screen md:w-[90vw] grid-cols-1 ' : 'w-screen md:w-[80vw] grid-cols-1'}`}> 
      Doctors
    </div>
  )
}

export default Doctors