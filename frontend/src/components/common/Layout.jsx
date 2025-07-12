import { Outlet } from 'react-router-dom'
import Header from './Header'
import Navigation from './Navigation'

const Layout = () => {
  return (
    <div className="min-h-screen bg-notion-bg">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-6 lg:p-8 ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout