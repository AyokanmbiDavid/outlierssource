import React, { useContext, useState, lazy, Suspanse} from 'react'
import { FastForward, Home, Key, Menu, User, Loader2Icon,Plus,Users,File,Church} from 'lucide-react'
import {motion} from "framer-motion"
import { all_provider } from './ContextProvider.jsx'
import { Link, useLocation } from 'react-router-dom';
 
const Navbar = () => {
  const { refresh,Notify} = useContext(all_provider);
  const [loading, setloading] = useState(false)
  const [sidebar,setsidebar]=useState(false)
  const menus = [
    { id: 1, title: "Initialize", icon: <Plus size={18} />, link: "/newattendance" },
    { id: 2, title: "Dashboard", icon: <Home size={18} />, link: "/admin" },
    { id: 3, title: "Roll History", icon: <File size={18} />, link: "/allattendance" },
    { id: 4, title: "Directory", icon: <Users size={18} />, link: "/memberdata" },
  ]

  async function refreshpage () {
      setloading(true)
      await refresh();
      setloading(false)
  }
  const location = useLocation().pathname
  
  return (
    <>
      <div className="w-full fixed top-0 left-0 z-40 p-3 bg-neutral-900 flex justify-between items-center">
          <div className="flex justify-center gap-3 items-center">
                {/* menu */}
              <div 
              onClick={() => setsidebar(!sidebar)}
              className="p-2 rounded-xl cursor-pointer">
                <Menu size={16} 
                className='text-gray-300/70'/>
              </div>

              <h1 className="font-semibold text-md text-gray-100 max-sm:text-sm flex flex-col">
                Teens Attendance
                <p className='text-xs text-gray-200 max-md:hidden rounded-4xl font-semibold'>RCCG Miracle Center</p>
              </h1>
          </div>

          <div className="flex gap-1 items-center">
            {/* refresh button */}
            <motion.button
            whileHover={{scale:[1.2,1,1.1]}}
            onClick={() => refreshpage()}
            className=" p-2 flex justify-center gap-1 items-center text-gray-300 text-xs cursor-pointer duration-200" >
              <span className="max-md:hidden bg-secondary-800 p-2 rounded-3xl rounded-r-xl">Refresh Page</span>
             <span className="bg-secondary-800 p-2 rounded-xl max-sm:rounded-r-xl rounded-r-3xl">
              <Loader2Icon size={14} className={`${loading && 'animate-spin'}`}
             size={17}/>
             </span>
             
            </motion.button>

            {/* home button */}
            <Link to={'/'}
            className='p-3 hover:bg-green-900/30 rounded-xl duration-200'>
              <motion.div 
              className="">
                <Home className='text-tertiary-700' size={20} />
              </motion.div>
            </Link>
            {/* Admin login */}
          </div>
      </div>

      {/* sidebar */}
      {sidebar && 
      <div 
      onClick={() => setsidebar(false)}
      className="fixed w-full h-screen z-50 top-0 bg-gray-600/60 left-0">
          <motion.div 
          initial={{x:-100}}
          animate={{x:0}}
          className="p-2 pl-4 border-r relative bg-neutral-900 h-screen w-[250px] ">
            <span className="text-sm py-3 font-semibold text-gray-500 flex gap-3 items-center">
            <Church size={20}></Church>
            <span className="text-primary-500">Teens Attendance</span>
            </span>

            {/* menus */}
            <div className="h-screen w-full flex flex-col mt-2">
             {menus.map((item,i) => (
              <>
                 <Link to={item.link}
                 onClick={() => setsidebar(false)}
                  className={`w-full flex justify-start p-2 py-4 rounded-3xl ${location == item.link && 'bg-secondary-800' } items-center gap-3`}>
                <span className={` ${location ==item.link ? "text-primary-600" : "text-primary-400" }`}>
                  {item.icon}
                </span>
                <span className={`${location == item.link ? 'text-tertiary-300 font-bold' : "text-tertiary-200"} text-xs font-semibold`}>{item.title}</span>
              </Link>
              </>
             ))}
            </div>

            <div className="absolute bottom-2 left-3 text-xs p-3 rounded-3xl bg-amber-800/10 ">
            <span className="text-gray-700" >This website was not vibecoded, but use a less of 20% of AI assistant</span>
            </div>
          </motion.div>
      </div>}
    </>
  )
}

export default Navbar