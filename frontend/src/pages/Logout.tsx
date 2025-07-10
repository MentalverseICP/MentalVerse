import { Button } from '@/components/ui/Button';
import { useSidebar } from '@/components/ui/Sidebar';
import { useTheme } from "@/components/theme-provider"
import { Link } from "react-router-dom"
import mentalIconMobileLight from "@/images/mental_Icon_mobile_light.svg"
import mentalIconMobileDark from "@/images/mental_Icon_mobile_dark1.svg"

const Logout = () => {
  const { state } = useSidebar()
  const { theme } = useTheme()
  const isCollapsed = state === "collapsed"

  const getIcon = () => {
      return theme === 'dark' ? mentalIconMobileDark : mentalIconMobileLight
  }

  return (
    <div className={`grid grid-cols-12 justify-evenly max-xs:ml-[4.5rem] max-md:ml-20 mt-4 mb-4 mr-2 w-fit max-sm:w-fit ${isCollapsed ? 'gap-5 w-fit md:pr-4 md:pl-2' : 'xl:gap-5 gap-5'}`}>
      <div className='-mt-10 text-red-500 font-bold text-lg'>Logout</div>
      <div className="border w-full h-96 col-span-12 mx-auto rounded-lg shadow-sm flex items-center justify-center flex-col space-y-4 ">
        <Link to={"/home"} className="flex items-center justify-between px-1">
          <img
            src={getIcon()}
            alt="Mental Verse"
            className="transition-all logo fill-mental h-24 w-48"
          />
        </Link>
        <div className="flex flex-col space-y-4 ">
          <label htmlFor="email" className="text-xs">Email</label>
          <input type="email" id="email" placeholder="example@mail.com" className='bg-transparent rounded-full border text-black py-3 px-5 text-sm' />
          <Button className='mt-10 rounded-full bg-[#18E614] text-white font-bold text-xs'>Logout</Button>
        </div>
      </div>
    </div>
  )
}

export default Logout