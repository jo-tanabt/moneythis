import { NavLink } from 'react-router-dom'

const Navigation = () => {
  const navItems = [
    { path: '/add-expense', label: 'Add', icon: '➕' },
    { path: '/expenses', label: 'Expenses', icon: '💰' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-notion-border px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors min-w-0 ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-notion-muted hover:text-notion-text hover:bg-notion-hover'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default Navigation