import React from 'react'
import { Outlet } from 'react-router-dom'
import SiderBar from './SiderBar'

const MainLayout = () => {
  return (
    <div>
      <SiderBar/>
      <div>
        <Outlet>
        </Outlet>
      </div>
    </div>
  )
}

export default MainLayout
