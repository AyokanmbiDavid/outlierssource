import React, { useContext,lazy,Suspense } from 'react'
const Navbar = lazy(() => import('./components/Navbar.jsx'))
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import Notify from './components/Notify.jsx'
import { all_provider } from './components/ContextProvider.jsx'
import MemberData from './pages/MemberData.jsx'
import NewAttendance from './pages/NewAttendance.jsx'
import AllAttendance from './pages/AllAttendance.jsx'
import './index.css'
import AnimatedBox from "./components/AnimatedBox"

const App = () => {
  const {notifystatus} = useContext(all_provider)
  return (
    <>
      <Suspense fallback={<AnimatedBox/>}>
      <Navbar/>
      </Suspense>
      
      {notifystatus.show == true && 
      <Notify/>}
      <div className="bg-grid bg-neutral-900 mt-[50px]">
        <Routes>
          <Route path='/' element={
          <Suspense fallback={<AnimatedBox/>}>
          <HomePage/>
          </Suspense>
            } />
          
          <Route path='/admin' element={
          <Suspense fallback={<AnimatedBox/>}>
          <AdminPage/>
          </Suspense>
            } />
          
          <Route path='/memberdata' element={
          <Suspense fallback={<AnimatedBox/>}>
          <MemberData/>
          </Suspense>
          } />
          
          <Route path='/newattendance' element={
          <Suspense fallback={<AnimatedBox/>}>
          <NewAttendance/>
          </Suspense>
          } />
          
          <Route path='/allattendance' element={
          <Suspense fallback={<AnimatedBox/>}>
          <AllAttendance/>
          </Suspense>
            } />
          
          <Route path='/memberdata' element={
          <Suspense fallback={<AnimatedBox/>}>
          <MemberData/>
          </Suspense>
            } />
        </Routes>
      </div>
    </>
  )
}

export default App