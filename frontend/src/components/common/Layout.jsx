import { Outlet } from 'react-router-dom'
import Header from './Header'
import Navigation from './Navigation'

const Layout = () => {
  return (
    <div className="min-h-screen bg-notion-bg pb-20">
      <Header />
      <main className="p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>
      <Navigation />
    </div>
  )
}

export default Layout