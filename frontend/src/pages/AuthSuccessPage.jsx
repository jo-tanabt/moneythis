import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner'

const AuthSuccessPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (token) {
      login(token)
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }, [searchParams, login, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-notion-bg">
      <div className="text-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-notion-muted">Signing you in...</p>
      </div>
    </div>
  )
}

export default AuthSuccessPage