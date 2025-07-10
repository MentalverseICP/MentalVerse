import { Button } from '@/components/ui/Button';
import { useSidebar } from '@/components/ui/Sidebar';

const Login = () => {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <div className={`grid grid-cols-12 justify-evenly max-xs:ml-[4.5rem] max-md:ml-20 mt-4 mb-4 mr-2 w-fit max-sm:w-fit ${isCollapsed ? 'gap-5 w-fit md:pr-4 md:pl-2' : 'xl:gap-5 gap-5'}`}>
      <div className='-mt-10 text-red-500 font-bold text-lg'>
        
      </div>
    </div>
  )
}

export default Login