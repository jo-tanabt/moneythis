import { useAuth } from '../../hooks/useAuth.jsx'

const Header = () => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white border-b border-notion-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-notion-text">ExpenseThis</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-notion-muted">
            Welcome, {user?.name}
          </span>
          <button
            onClick={logout}
            className="notion-button-secondary text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header